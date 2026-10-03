FROM gradle:9.7.1-jdk21 AS build

WORKDIR /app

COPY eureka-server /app/eureka-server

RUN gradle -p /app/eureka-server bootJar --no-daemon

FROM eclipse-temurin:21-jre

WORKDIR /app

COPY --from=build /app/eureka-server/build/libs/*.jar app.jar

EXPOSE 8761

ENTRYPOINT ["java", "-jar", "app.jar"]