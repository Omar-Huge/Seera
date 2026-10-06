import sys, os, types
import numpy as np
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
import air_draw_fingers as ad


class P:
    def __init__(self, x=0.5, y=0.5): self.x, self.y = x, y


def hand(index=False, middle=False, ring=False, pinky=False):
    """21 landmarks; a finger is 'up' when tip.y < pip.y."""
    lm = [P(0.5, 0.5) for _ in range(21)]
    for up, tip, pip in [(index, 8, 6), (middle, 12, 10), (ring, 16, 14), (pinky, 20, 18)]:
        lm[tip].y, lm[pip].y = (0.2, 0.4) if up else (0.6, 0.4)
    return lm


# ---- unit: gestures ----
@pytest.mark.parametrize("kw,expected", [
    (dict(index=True), (True, False)),                       # point = draw
    (dict(index=True, middle=True), (False, False)),         # peace = move
    (dict(), (False, True)),                                 # fist = erase
    (dict(middle=True), (False, False)),
    (dict(pinky=True), (False, False)),
    (dict(index=True, middle=True, ring=True, pinky=True), (False, False)),  # open palm
    (dict(index=True, ring=True), (True, False)),            # documents current behaviour
])
def test_classify(kw, expected):
    assert ad.classify_gesture(hand(**kw)) == expected

def test_draw_and_erase_never_both():
    import itertools
    for combo in itertools.product([False, True], repeat=4):
        d, e = ad.classify_gesture(hand(*combo))
        assert not (d and e)

def test_finger_up_equal_y_is_down():
    lm = hand(); lm[8].y = lm[6].y
    assert not ad.finger_is_up(lm, 8, 6)

def test_palm_center():
    lm = [P(0.5, 0.5) for _ in range(21)]
    assert ad.palm_center(lm, 640, 480) == (320, 240)

def test_palm_center_scales_and_ints():
    lm = [P(1.0, 1.0) for _ in range(21)]
    cx, cy = ad.palm_center(lm, 640, 480)
    assert (cx, cy) == (640, 480) and isinstance(cx, int)

def test_smooth_first_and_blend():
    assert list(ad.smooth_point((10, 20), None)) == [10, 20]
    assert list(ad.smooth_point((10, 20), np.array([0., 0.]))) == [5, 10]

def test_smooth_converges():
    s = np.array([0., 0.])
    for _ in range(40): s = ad.smooth_point((100, 100), s)
    assert abs(s[0] - 100) < 1e-6

def test_colors_valid():
    assert len(ad.COLORS) == 4
    for name, bgr in ad.COLORS:
        assert len(bgr) == 3 and all(0 <= c <= 255 for c in bgr)
    assert len({n for n, _ in ad.COLORS}) == 4


# ---- integration: run the real main() loop headless ----
class FakeCap:
    def __init__(self, n, ok=True): self.n, self.ok, self.released = n, ok, False
    def isOpened(self): return self.ok
    def read(self):
        if self.n <= 0: return False, None
        self.n -= 1
        return True, np.full((480, 640, 3), 40, np.uint8)
    def release(self): self.released = True


class FakeHands:
    """script: list of landmark lists (or None for no hand), one per frame."""
    def __init__(self, script): self.script, self.i = script, 0
    def process(self, _):
        lm = self.script[min(self.i, len(self.script) - 1)]; self.i += 1
        if lm is None: return types.SimpleNamespace(multi_hand_landmarks=None)
        return types.SimpleNamespace(multi_hand_landmarks=[types.SimpleNamespace(landmark=lm)])


def run(monkeypatch, tmp_path, script, keys, frames=None):
    monkeypatch.chdir(tmp_path)
    cap = FakeCap(frames or len(script))
    shown = []
    keys = list(keys)
    monkeypatch.setattr(ad.cv2, "VideoCapture", lambda *a: cap)
    monkeypatch.setattr(ad.cv2, "imshow", lambda n, img: shown.append(img.copy()))
    def wait(d):
        k = keys.pop(0) if keys else ""
        return ord(k) if k else 255
    monkeypatch.setattr(ad.cv2, "waitKey", wait)
    monkeypatch.setattr(ad.cv2, "destroyAllWindows", lambda: None)
    monkeypatch.setattr(ad.mp_draw, "draw_landmarks", lambda *a, **k: None)
    monkeypatch.setattr(ad.mp_hands, "Hands", lambda **k: FakeHands(script))
    ad.main()
    return shown, cap

def pointing(x, y):
    lm = hand(index=True); lm[8].x, lm[8].y = x, y; lm[6].y = y + 0.1
    return lm

def test_loop_draws_line(monkeypatch, tmp_path):
    script = [pointing(0.2 + 0.05 * i, 0.5) for i in range(8)]
    shown, cap = run(monkeypatch, tmp_path, script, [""] * 7 + ["q"])
    assert cap.released
    # drawn green pixels exist in the last frame
    assert (shown[-1] == np.array([0, 255, 0])).all(axis=2).sum() > 50

def test_loop_pen_up_no_ink(monkeypatch, tmp_path):
    peace = hand(index=True, middle=True)
    shown, _ = run(monkeypatch, tmp_path, [peace] * 5, [""] * 4 + ["q"])
    assert not (shown[-1] == np.array([0, 255, 0])).all(axis=2).any()

def test_loop_clear_color_save(monkeypatch, tmp_path):
    script = [pointing(0.2 + 0.05 * i, 0.5) for i in range(8)] + [hand(index=True, middle=True)] * 2
    # frame0-3 draw, '2' selects cyan, more draw, 's' save, 'c' clear, 'q'
    keys = ["", "", "", "2", "", "", "s", "c", "", "q"]
    shown, _ = run(monkeypatch, tmp_path, script, keys)
    assert (tmp_path / "air_drawing.png").exists()
    cyan = np.array([255, 255, 0])
    assert (shown[6] == cyan).all(axis=2).any()           # cyan ink before clear
    assert not (shown[-1] == cyan).all(axis=2).any()      # cleared

def test_loop_fist_erases(monkeypatch, tmp_path):
    draw = [pointing(0.5, 0.5)] * 1 + [pointing(0.55, 0.5)] * 5
    fist = hand(); [setattr(p, "x", 0.5) for p in fist]   # palm at center
    script = draw + [fist] * 4
    shown, _ = run(monkeypatch, tmp_path, script, [""] * 9 + ["q"])
    g = np.array([0, 255, 0])
    assert (shown[5] == g).all(axis=2).any()
    assert not (shown[-1] == g).all(axis=2).any()

def test_loop_hand_lost_breaks_stroke(monkeypatch, tmp_path):
    script = [pointing(0.1, 0.5), pointing(0.1, 0.5), None, pointing(0.9, 0.5), pointing(0.9, 0.5)]
    shown, _ = run(monkeypatch, tmp_path, script, [""] * 4 + ["q"])
    # no connecting line across the middle of the frame (x ~ 320)
    mid = (shown[-1][:, 300:340] == np.array([0, 255, 0])).all(axis=2)
    assert not mid.any()

def test_no_hand_does_not_crash(monkeypatch, tmp_path):
    shown, cap = run(monkeypatch, tmp_path, [None] * 3, ["", "", "q"])
    assert len(shown) == 3 and cap.released

def test_camera_failure_exits(monkeypatch):
    monkeypatch.setattr(ad.cv2, "VideoCapture", lambda *a: FakeCap(0, ok=False))
    monkeypatch.setattr(ad.mp_hands, "Hands", lambda **k: FakeHands([None]))
    with pytest.raises(SystemExit):
        ad.main()

def test_stream_end_exits_cleanly(monkeypatch, tmp_path):
    shown, cap = run(monkeypatch, tmp_path, [None], [""], frames=2)
    assert cap.released
