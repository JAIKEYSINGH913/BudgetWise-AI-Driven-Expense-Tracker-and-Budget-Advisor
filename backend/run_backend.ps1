# Load .env variables
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($name, $value, [System.EnvironmentVariableTarget]::Process)
        }
    }
    Write-Host "Loaded environment variables from .env" -ForegroundColor Green
}
else {
    Write-Host ".env file not found!" -ForegroundColor Red
}

# Run Spring Boot
mvn spring-boot:run
