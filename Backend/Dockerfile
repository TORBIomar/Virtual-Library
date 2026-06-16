FROM eclipse-temurin:17-jdk-jammy AS builder
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
# Make sure mvnw is executable
RUN chmod +x ./mvnw
# Download dependencies
RUN ./mvnw dependency:go-offline
# Copy source code and build
COPY src ./src
RUN ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

# Create directory for uploads
RUN mkdir -p /app/uploads/books && chmod -R 777 /app/uploads

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
