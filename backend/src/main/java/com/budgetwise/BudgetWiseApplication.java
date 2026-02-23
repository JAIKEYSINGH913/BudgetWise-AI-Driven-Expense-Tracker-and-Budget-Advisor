package com.budgetwise;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.stream.Stream;

@SpringBootApplication
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
				System.out.println("Successfully loaded native .env file configurations.");
				System.out.println("DEBUG: MAIL_HOST=" + System.getProperty("MAIL_HOST"));
				System.out.println("DEBUG: MAIL_USERNAME=" + System.getProperty("MAIL_USERNAME"));
			} catch (Exception e) {
				System.err.println("Failed to parse native .env file: " + e.getMessage());
			}
		}
	}

}
