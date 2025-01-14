package com.kblab.exception;

public class SwitchNotFoundException  extends RuntimeException {
    public SwitchNotFoundException(Long switchId) {
        super("Switch not found with id: " + switchId);
    }
}
