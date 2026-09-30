package com.dreamsol.master.config;

import com.dreamsol.common.security.CommonJwtService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CommonJwtConfig {

    @Bean
    public CommonJwtService commonJwtService() {
        return new CommonJwtService();
    }
}