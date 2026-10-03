FROM gradle:9.7.1-jdk21 AS build

WORKDIR /app

COPY common-service /app/common-service
COPY department-master /app/department-master

RUN gradle -p /app/common-service publishToMavenLocal --no-daemon

RUN gradle -p /app/department-master bootJar --no-daemon

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/department-master/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]