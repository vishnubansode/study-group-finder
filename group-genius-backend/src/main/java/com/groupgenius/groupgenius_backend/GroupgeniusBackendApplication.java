package com.groupgenius.groupgenius_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class GroupgeniusBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(GroupgeniusBackendApplication.class, args);
	}

}
