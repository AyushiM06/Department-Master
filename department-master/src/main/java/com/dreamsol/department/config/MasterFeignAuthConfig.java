package com.dreamsol.department.config;

import feign.RequestInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Objects;

@Configuration
public class MasterFeignAuthConfig {
    @Bean
    public RequestInterceptor masterAuthInterceptor() {
        return requestTemplate -> {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (Objects.isNull(attributes))
                return;
            HttpServletRequest request = attributes.getRequest();
            String authorization = request.getHeader("Authorization");
            if (Objects.nonNull(authorization) && authorization.startsWith("Bearer "))
                requestTemplate.header("Authorization", authorization);
        };
    }
}