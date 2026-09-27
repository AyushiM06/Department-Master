package com.dreamsol.department;
import com.dreamsol.common.cache.RedisCacheConfig;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Import;

@SpringBootApplication(scanBasePackages = {"com.dreamsol.department", "com.dreamsol.common"})
@EnableFeignClients
@Import(RedisCacheConfig.class)
public class DepartmentMasterApplication {
	public static void main(String[] args) {
		SpringApplication.run(DepartmentMasterApplication.class, args);
	}
}
