#!/usr/bin/env python3
"""
air_draw_fingers.py
Air drawing with your fingertip, powered by MediaPipe Hands.
Run on Linux/macOS:  python3 air_draw_fingers.py
Gestures: index finger up = draw, peace sign = move, closed fist = erase. Keys: 1-4 color, c clear, s save, q quit.
"""

import sys

import cv2
import numpy as np
import mediapipe as mp

mp_hands = mp.solutions.hands
mp_draw = mp.solutions.drawing_utils

INDEX_TIP, INDEX_PIP = 8, 6
MIDDLE_TIP, MIDDLE_PIP = 12, 10
RING_TIP, RING_PIP = 16, 14
PINKY_TIP, PINKY_PIP = 20, 18
PALM = (0, 5, 9, 13, 17)
ERASER_RADIUS = 45

COLORS = [
    ("green",  (0, 255, 0)),
    ("cyan",   (255, 255, 0)),
    ("pink",   (180, 105, 255)),
    ("yellow", (0, 255, 255)),
]


def finger_is_up(landmarks, tip, pip):
    return landmarks[tip].y < landmarks[pip].y


def classify_gesture(lm):
    """Return (pen_down, erasing) for a list of 21 hand landmarks."""
    index_up = finger_is_up(lm, INDEX_TIP, INDEX_PIP)
    middle_up = finger_is_up(lm, MIDDLE_TIP, MIDDLE_PIP)
    ring_up = finger_is_up(lm, RING_TIP, RING_PIP)
    pinky_up = finger_is_up(lm, PINKY_TIP, PINKY_PIP)
    erasing = not (index_up or middle_up or ring_up or pinky_up)
    pen_down = index_up and not middle_up and not erasing
    return pen_down, erasing


def palm_center(lm, w, h):
    return (int(sum(lm[i].x for i in PALM) / len(PALM) * w),
            int(sum(lm[i].y for i in PALM) / len(PALM) * h))


def smooth_point(pos, smooth):
    pos = np.asarray(pos, dtype=float)
    return pos if smooth is None else 0.5 * pos + 0.5 * smooth


def main():
    hands = mp_hands.Hands(
        max_num_hands=1,
        min_detection_confidence=0.7,
        min_tracking_confidence=0.5,
    )
    cap = (cv2.VideoCapture(0, cv2.CAP_AVFOUNDATION) if sys.platform == "darwin"
           else cv2.VideoCapture(0))
    if not cap.isOpened():
        raise SystemExit("Could not open the webcam. On macOS, allow camera access for "
                         "your terminal in System Settings > Privacy & Security > Camera.")

    canvas = None
    prev = None
    smooth = None
    color_idx = 0

    while True:
        ok, frame = cap.read()
        if not ok:
            break
        frame = cv2.flip(frame, 1)
        h, w = frame.shape[:2]
        if canvas is None:
            canvas = np.zeros_like(frame)

        result = hands.process(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))

        pen_down = False
        erasing = False
        visible = False
        if result.multi_hand_landmarks:
            hand = result.multi_hand_landmarks[0]
            mp_draw.draw_landmarks(frame, hand, mp_hands.HAND_CONNECTIONS)
            lm = hand.landmark
            visible = True

            pen_down, erasing = classify_gesture(lm)

            if erasing:
                ex, ey = palm_center(lm, w, h)
                cv2.circle(canvas, (ex, ey), ERASER_RADIUS, (0, 0, 0), -1)
                cv2.circle(frame, (ex, ey), ERASER_RADIUS, (0, 0, 255), 2)

            x, y = int(lm[INDEX_TIP].x * w), int(lm[INDEX_TIP].y * h)
            smooth = smooth_point((x, y), smooth)
            cur = (int(smooth[0]), int(smooth[1]))

            if pen_down:
                if prev is not None:
                    cv2.line(canvas, prev, cur, COLORS[color_idx][1], 6)
                prev = cur
            else:
                prev = None

            if not erasing:
                ring = COLORS[color_idx][1] if pen_down else (120, 120, 120)
                cv2.circle(frame, cur, 12, ring, 2)

        if not visible:
            prev = None
            smooth = None

        mask = canvas.sum(axis=2) > 0
        display = frame.copy()
        display[mask] = canvas[mask]

        state = "ERASING" if erasing else "DRAWING" if pen_down else "PEN UP"
        cv2.putText(display, f"{state} | {COLORS[color_idx][0]}", (12, 32),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2)
        cv2.putText(display, "point=draw  peace=move  fist=erase  1-4 color  c clear  s save  q quit",
                    (12, display.shape[0] - 15), cv2.FONT_HERSHEY_SIMPLEX,
                    0.5, (200, 200, 200), 1)

        cv2.imshow("Air Draw (fingertip) - q quit", display)
        key = cv2.waitKey(1) & 0xFF
        if key == ord("q"):
            break
        elif key == ord("c"):
            canvas = np.zeros_like(frame)
            prev = None
        elif key == ord("s"):
            cv2.imwrite("air_drawing.png", display)
            print("Saved air_drawing.png")
        elif key in (ord("1"), ord("2"), ord("3"), ord("4")):
            color_idx = key - ord("1")

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()