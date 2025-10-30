package com.groupgenius.groupgenius_backend.dto;

import lombok.Data;
import com.groupgenius.groupgenius_backend.entity.HelpChatInteraction;

@Data
public class HelpChatInteractionRequest {
    private String question;
    private String sessionId;
    private HelpChatInteraction.InteractionType type;
    private String userAgent;
    private String pageContext;

    public HelpChatInteraction toEntity() {
        HelpChatInteraction interaction = new HelpChatInteraction();
        interaction.setQuestion(this.question);
        interaction.setSessionId(this.sessionId);
        interaction.setType(this.type);
        interaction.setUserAgent(this.userAgent);
        interaction.setPageContext(this.pageContext);
        return interaction;
    }
}