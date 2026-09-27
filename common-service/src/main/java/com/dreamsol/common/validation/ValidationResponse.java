package com.dreamsol.common.validation;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ValidationResponse {

    private boolean valid;

    private String message;

    public ValidationResponse() {
    }

    public ValidationResponse(boolean valid, String message) {
        this.valid = valid;
        this.message = message;
    }

    public static ValidationResponse success() {
        return new ValidationResponse(true, null);
    }

    public static ValidationResponse failure(String message) {
        return new ValidationResponse(false, message);
    }
}
