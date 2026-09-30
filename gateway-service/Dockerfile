FROM gradle:9.7.1-jdk21 AS build

WORKDIR /app

COPY gateway-service /app/gateway-service

RUN --mount=type=cache,target=/home/gradle/.gradle \
    gradle -p /app/gateway-service bootJar --no-daemon

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/gateway-service/build/libs/*.jar app.jar

EXPOSE 8085

ENTRYPOINT ["java", "-jar", "app.jar"]