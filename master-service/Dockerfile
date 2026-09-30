FROM gradle:9.7.1-jdk21 AS build

WORKDIR /app

COPY common-service /app/common-service
COPY master-service /app/master-service

RUN --mount=type=cache,target=/home/gradle/.gradle \
    gradle -p /app/common-service publishToMavenLocal --no-daemon

RUN --mount=type=cache,target=/home/gradle/.gradle \
    gradle -p /app/master-service bootJar --no-daemon

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/master-service/build/libs/*.jar app.jar

EXPOSE 8083

ENTRYPOINT ["java", "-jar", "app.jar"]