package com.dreamsol.common.validation;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ValidationUtil {

    private final Validator validator;

    public String getValidationError(Object object) {

        if (object == null) {
            return "Request cannot be null";
        }

        Set<ConstraintViolation<Object>> violations =
                validator.validate(object);

        if (violations.isEmpty()) {
            return null;
        }

        return violations.stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining(", "));
    }

}
