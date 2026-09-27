package com.dreamsol.common.email;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
@RequiredArgsConstructor
public class CommonEmailService {

    private final JavaMailSender mailSender;

    public void send(
            String to,
            String subject,
            String body,
            String attachmentPath,
            String attachmentFileName
    ) {
        try {
            boolean hasAttachment =
                    attachmentPath != null && !attachmentPath.isBlank();

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper =
                    new MimeMessageHelper(message, hasAttachment);

            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body);

            if (hasAttachment) {
                Path path = Paths.get(attachmentPath);

                if (Files.exists(path) && Files.isRegularFile(path)) {
                    helper.addAttachment(
                            attachmentFileName,
                            new FileSystemResource(path.toFile())
                    );
                }
            }

            mailSender.send(message);

        } catch (Exception ex) {
            throw new RuntimeException("Email sending failed", ex);
        }
    }
}