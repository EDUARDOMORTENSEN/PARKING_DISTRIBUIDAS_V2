package ec.edu.espe.zonas.infrastructure.messaging;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.CommandLineRunner;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.fasterxml.jackson.databind.SerializationFeature;

@Configuration
public class RabbitMQConfig {

    // El formato "${propiedad}" lee lo que configuramos en el application.yml
    @Value("${app.rabbitmq.exchange}")
    private String exchangeName;

    @Value("${app.rabbitmq.queue}")
    private String queueName;

    @Value("${app.rabbitmq.routing-key}")
    private String routingKey;

    // Métodos para obtener los valores en otras clases (como el servicio productor)
    public String getExchangeName() { return exchangeName; }
    public String getRoutingKey() { return routingKey; }

    @Value("${app.rabbitmq.audit-exchange}")
    private String auditExchangeName;

    @Value("${app.rabbitmq.audit-routing-key}")
    private String auditRoutingKey;

    public String getAuditExchangeName() { return auditExchangeName; }
    public String getAuditRoutingKey() { return auditRoutingKey; }

    @Bean
    public Queue queue() {
        return new Queue(queueName, true); // true = durable (sobrevive a reinicios del broker)
    }

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(exchangeName);
    }

    @Bean
    public TopicExchange auditExchange() {
        return new TopicExchange(auditExchangeName);
    }

    @Bean
    public Binding binding(Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(routingKey);
    }

    // Dependencia necesaria para manejar serialización sin error.
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        // Registra el módulo para manejar LocalDateTime, LocalDate, etc.
        mapper.registerModule(new JavaTimeModule());
        // Opcional: Evita que las fechas se guarden como arreglos de números [2026,7,12,...]
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }

    @Bean
    public Jackson2JsonMessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }

    @Bean
    public CommandLineRunner testRabbitConnection(ConnectionFactory connectionFactory) {
        return args -> {
            System.out.println("====== PROBANDO CONEXIÓN MANUAL A RABBITMQ ======");
            try {
                // Forzamos la creación de la conexión TCP real
                connectionFactory.createConnection().close();
                System.out.println("====== [ÉXITO] CONECTADO CORRECTAMENTE A RABBITMQ ======");
            } catch (Exception e) {
                System.err.println("====== [ERROR] FALLÓ LA CONEXIÓN A RABBITMQ ======");
                System.err.println("Causa del fallo: " + e.getMessage());
            }
        };
    }
}