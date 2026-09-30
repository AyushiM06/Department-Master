FROM gradle:9.7.1-jdk21 AS build

WORKDIR /app

COPY config-server /app/config-server

RUN --mount=type=cache,target=/home/gradle/.gradle \
    gradle -p /app/config-server bootJar --no-daemon

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/config-server/build/libs/*.jar app.jar

EXPOSE 8888

ENTRYPOINT ["java", "-jar", "app.jar"]