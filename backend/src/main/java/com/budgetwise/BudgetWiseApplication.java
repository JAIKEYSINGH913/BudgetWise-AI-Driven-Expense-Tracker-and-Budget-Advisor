package com.budgetwise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

@SpringBootApplication
@EnableAsync
public class BudgetWiseApplication {

	public static void main(String[] args) {
		loadEnv();
		SpringApplication.run(BudgetWiseApplication.class, args);
	}

	private static void loadEnv() {
		Path envFile = Paths.get(".env");
		if (Files.exists(envFile)) {
			try (Stream<String> lines = Files.lines(envFile)) {
				lines.filter(line -> line.contains("=") && !line.trim().startsWith("#"))
						.forEach(line -> {
							String[] parts = line.split("=", 2);
							if (parts.length == 2 && System.getProperty(parts[0].trim()) == null) {
								System.setProperty(parts[0].trim(), parts[1].trim());
							}
						});
				System.out.println("Successfully loaded local .env file configurations.");
			} catch (Exception e) {
				System.err.println("Failed to parse .env file: " + e.getMessage());
			}
		} else {
			System.out.println("No .env file found. Relying on System environment variables (standard for Render).");
		}

		// Debug prints for critical configs (Values will show if set via System Env OR
		// .env file)
		System.out.println("LOGGING_CONFIG: Using SMTP Host: " + getEnvOrProperty("MAIL_HOST", "not set"));
		System.out.println("LOGGING_CONFIG: Using SMTP Port: " + getEnvOrProperty("MAIL_PORT", "465 (Default)"));
		System.out.println("LOGGING_CONFIG: Using SMTP User: " + getEnvOrProperty("MAIL_USERNAME", "not set"));
	}

	private static String getEnvOrProperty(String key, String defaultValue) {
		String val = System.getenv(key);
		if (val == null)
			val = System.getProperty(key);
		return (val != null) ? val : defaultValue;
	}
}
