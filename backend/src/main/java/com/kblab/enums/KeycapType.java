package com.kblab.enums;

public enum KeycapType {
    NONE,
    TRANSPARENT,
    RANDOM;

    public static boolean isValid(String keycaps) {
        try {
            KeycapType.valueOf(keycaps.toUpperCase());
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
