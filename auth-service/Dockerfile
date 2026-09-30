FROM gradle:9.7.1-jdk21 AS build

WORKDIR /app

COPY common-service /app/common-service
COPY auth-service /app/auth-service

RUN --mount=type=cache,target=/home/gradle/.gradle \
    gradle -p /app/common-service publishToMavenLocal --no-daemon

RUN --mount=type=cache,target=/home/gradle/.gradle \
    gradle -p /app/auth-service bootJar --no-daemon

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/auth-service/build/libs/*.jar app.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "app.jar"]