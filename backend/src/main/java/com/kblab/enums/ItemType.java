package com.kblab.enums;

public enum ItemType {
    SIMPLE_ITEM_1,
    SIMPLE_ITEM_2,
    CUSTOM_SWITCH_TESTER;

    public static boolean isValid(String name) {
        try {
            ItemType.valueOf(name.toUpperCase().replace(" ", "_"));
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }
}
