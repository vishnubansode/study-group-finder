package com.groupgenius.groupgenius_backend.service;

import com.groupgenius.groupgenius_backend.entity.HelpChatInteraction;
import com.groupgenius.groupgenius_backend.entity.User;
import com.groupgenius.groupgenius_backend.repository.HelpChatInteractionRepository;
import com.groupgenius.groupgenius_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class HelpChatService {

    private final HelpChatInteractionRepository interactionRepository;
    private final UserRepository userRepository;

    // Comprehensive response mapping for common queries
    private final Map<String, String> responseMap = Map.ofEntries(
            // Group-related queries
            Map.entry("how to join a group",
                    "To join a study group:\n\n" +
                            "1. 📚 Go to the 'Groups' section from the main navigation\n" +
                            "2. 🔍 Browse available groups or use filters to find your interest area\n" +
                            "3. 💡 Click on a group card to view detailed information\n" +
                            "4. ✅ Press the 'Join Group' button\n" +
                            "5. ⏳ Wait for group admin approval (if required)\n\n" +
                            "You'll receive a notification once you're added to the group! 🎉"),

            Map.entry("join group",
                    "Joining a group is easy! 🚀\n\n" +
                            "• Visit the Groups page\n" +
                            "• Find a group that matches your interests\n" +
                            "• Click 'Join Group' on the group card\n" +
                            "• Some groups may require admin approval\n\n" +
                            "Looking for a specific subject? Use the search filters!"),

            Map.entry("group join process",
                    "Group Join Process: 📋\n\n" +
                            "Step 1: Find Groups\n" +
                            "   - Navigate to Groups section\n" +
                            "   - Use filters by course, subject, or level\n" +
                            "   - Read group descriptions and rules\n\n" +
                            "Step 2: Request to Join\n" +
                            "   - Click 'View Details' on preferred group\n" +
                            "   - Press 'Join Group' button\n" +
                            "   - Add a join message (optional)\n\n" +
                            "Step 3: Wait for Approval\n" +
                            "   - Instant join for open groups\n" +
                            "   - Admin approval for private groups\n" +
                            "   - You'll be notified of the decision"),

            Map.entry("how to create a group",
                    "Creating your own study group: 🎯\n\n" +
                            "1. Click 'Create Group' in the Groups section\n" +
                            "2. Fill in group details:\n" +
                            "   • Group name and description\n" +
                            "   • Associated course/subject\n" +
                            "   • Maximum number of members\n" +
                            "   • Meeting schedule and frequency\n" +
                            "   • Group rules and expectations\n" +
                            "3. Set privacy settings (open/private)\n" +
                            "4. Publish your group\n\n" +
                            "Once created, other students can find and join your group! 👥"),

            Map.entry("create study group",
                    "Ready to start a study group? Here's how: 📝\n\n" +
                            "• Go to Groups → Create New Group\n" +
                            "• Choose a clear, descriptive name\n" +
                            "• Set the subject/course focus\n" +
                            "• Define meeting times and platform\n" +
                            "• Establish group goals\n" +
                            "• Decide on membership approval\n\n" +
                            "Tip: Be specific about your study objectives!"),

            // Course-related queries
            Map.entry("how to enroll in a course",
                    "Course Enrollment Process: 🎓\n\n" +
                            "1. Navigate to 'Courses' in the sidebar\n" +
                            "2. Search for your desired course using the search bar\n" +
                            "3. Click on the course card for detailed information\n" +
                            "4. Press the 'Enroll' button\n" +
                            "5. Complete any required prerequisites\n\n" +
                            "After enrollment, you can:\n" +
                            "• Find peers in the same course\n" +
                            "• Join course-specific groups\n" +
                            "• Access course materials\n" +
                            "• Create study groups for the course"),

            Map.entry("enroll in course",
                    "Enrolling in courses: 📘\n\n" +
                            "• Browse available courses in Courses section\n" +
                            "• Use filters by department, level, or professor\n" +
                            "• Check course requirements before enrolling\n" +
                            "• Click 'Enroll' on your chosen course\n" +
                            "• Some courses may have prerequisites\n\n" +
                            "Enrollment gives you access to course-specific features!"),

            Map.entry("course registration",
                    "Course Registration Steps: 🏫\n\n" +
                            "Step 1: Course Discovery\n" +
                            "   - Browse course catalog\n" +
                            "   - Read course descriptions\n" +
                            "   - Check schedules and requirements\n\n" +
                            "Step 2: Enrollment\n" +
                            "   - Click 'Enroll' on selected course\n" +
                            "   - Confirm enrollment\n" +
                            "   - Wait for confirmation\n\n" +
                            "Step 3: Post-Enrollment\n" +
                            "   - Access course dashboard\n" +
                            "   - Find study partners\n" +
                            "   - Join course discussions"),

            // Peer finding queries
            Map.entry("find peers",
                    "Finding study peers: 👥\n\n" +
                            "1. First, enroll in your desired courses\n" +
                            "2. Visit the 'Courses' section\n" +
                            "3. Click on your enrolled course\n" +
                            "4. View the 'Course Peers' tab\n" +
                            "5. Browse students in the same course\n" +
                            "6. Send connection requests or invite to groups\n\n" +
                            "Building your network helps in forming effective study groups! 🤝"),

            Map.entry("find study partners",
                    "Looking for study partners? Here's how: 🔍\n\n" +
                            "• Enroll in courses first\n" +
                            "• Check 'Course Peers' for each course\n" +
                            "• View peer profiles and study preferences\n" +
                            "• Send connection requests\n" +
                            "• Create group invitations\n" +
                            "• Join existing study groups\n\n" +
                            "Pro tip: Be active in course discussions to meet peers!"),

            Map.entry("connect with students",
                    "Connecting with fellow students: 🌐\n\n" +
                            "Course-Based Connections:\n" +
                            "   - Enroll in same courses\n" +
                            "   - Browse course peer lists\n" +
                    "   - Send connection requests\n\n" +
                            "Group-Based Connections:\n" +
                            "   - Join study groups\n" +
                            "   - Participate in group discussions\n" +
                            "   - Attend virtual study sessions\n\n" +
                            "Profile Visibility:\n" +
                            "   - Complete your profile\n" +
                            "   - Share your study interests\n" +
                            "   - Set availability preferences"),

            // Account management queries
            Map.entry("reset password",
                    "Password Reset Options: 🔒\n\n" +
                            "Option 1: Through Settings\n" +
                            "   - Click your profile picture (top-right)\n" +
                            "   - Select 'Settings' from dropdown\n" +
                            "   - Go to 'Security' tab\n" +
                            "   - Click 'Change Password'\n" +
                            "   - Enter current and new password\n" +
                            "   - Save changes\n\n" +
                            "Option 2: Forgot Password\n" +
                            "   - Go to login page\n" +
                            "   - Click 'Forgot Password'\n" +
                            "   - Enter your email\n" +
                            "   - Check email for reset link\n" +
                            "   - Create new password"),

            Map.entry("change password",
                    "Changing your password: 🛡️\n\n" +
                            "1. Click your profile picture → Settings\n" +
                            "2. Navigate to Security tab\n" +
                            "3. Click 'Change Password'\n" +
                            "4. Enter:\n" +
                            "   • Current password\n" +
                            "   • New password (min 8 characters)\n" +
                            "   • Confirm new password\n" +
                            "5. Click 'Update Password'\n\n" +
                            "For security, use a strong, unique password!"),

            Map.entry("update profile",
                    "Updating Your Profile: 👤\n\n" +
                            "Profile Settings Access:\n" +
                            "   - Click your profile picture → Profile\n" +
                            "   - Or go to Settings → Profile\n\n" +
                            "Editable Information:\n" +
                            "   • Personal details\n" +
                            "   • Academic information\n" +
                            "   • Study preferences\n" +
                            "   • Contact information\n" +
                            "   • Profile picture\n\n" +
                            "Tip: Complete profiles get more connection requests!"),

            // Platform navigation queries
            Map.entry("how to use platform",
                    "Getting Started with GroupGenius: 🚀\n\n" +
                            "Step 1: Complete Your Profile\n" +
                            "   - Add academic information\n" +
                            "   - Set study preferences\n" +
                            "   - Upload profile picture\n\n" +
                            "Step 2: Explore Courses\n" +
                            "   - Browse course catalog\n" +
                            "   - Enroll in your courses\n" +
                            "   - Access course materials\n\n" +
                            "Step 3: Join Communities\n" +
                            "   - Find study groups\n" +
                            "   - Connect with peers\n" +
                            "   - Participate in discussions\n\n" +
                            "Need specific help? Just ask me! 💬"),

            Map.entry("navigation help",
                    "Platform Navigation Guide: 🗺️\n\n" +
                            "Main Sections:\n" +
                            "📊 Dashboard - Overview of your activities\n" +
                            "🎓 Courses - Enroll and manage courses\n" +
                            "👥 Groups - Find and join study groups\n" +
                            "📅 Calendar - Schedule and events\n" +
                            "💬 Chat - Direct messaging\n" +
                            "👤 Profile - Your account settings\n\n" +
                            "Quick Actions:\n" +
                            "• Use search bar to find content\n" +
                            "• Check notifications for updates\n" +
                            "• Access help widget (that's me!) anytime"),

            // Default response
            Map.entry("default",
                    "I'm here to help you navigate GroupGenius! 🤗\n\n" +
                            "Here are common things I can help with:\n\n" +
                            "📚 **Group Management**\n" +
                            "• \"How to join a group\" - Find and join study groups\n" +
                            "• \"How to create a group\" - Start your own study group\n" +
                            "• \"Group join process\" - Step-by-step guidance\n\n" +
                            "🎓 **Course System**\n" +
                            "• \"How to enroll in a course\" - Course enrollment process\n" +
                            "• \"Course registration\" - Complete registration steps\n\n" +
                            "👥 **Networking**\n" +
                            "• \"Find peers\" - Connect with other students\n" +
                            "• \"Find study partners\" - Locate study buddies\n\n" +
                            "⚙️ **Account Management**\n" +
                            "• \"Reset password\" - Account security help\n" +
                            "• \"Update profile\" - Profile customization\n\n" +
                            "What would you like to know? Just type your question! 💭")
    );

    public HelpChatInteraction saveInteraction(HelpChatInteraction interaction, String username) {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        interaction.setUser(user);

        // Generate response based on question
        String response = generateResponse(interaction.getQuestion());
        interaction.setResponse(response);

        return interactionRepository.save(interaction);
    }

    public String generateResponse(String userQuestion) {
        if (userQuestion == null || userQuestion.trim().isEmpty()) {
            return responseMap.get("default");
        }

        String lowerQuestion = userQuestion.toLowerCase().trim();

        // Check for exact matches first
        for (String key : responseMap.keySet()) {
            if (lowerQuestion.contains(key) && !key.equals("default")) {
                return responseMap.get(key);
            }
        }

        // Check for partial matches with priority
        if (lowerQuestion.contains("join") && lowerQuestion.contains("group")) {
            return responseMap.get("how to join a group");
        }
        if (lowerQuestion.contains("enroll") && lowerQuestion.contains("course")) {
            return responseMap.get("how to enroll in a course");
        }
        if (lowerQuestion.contains("create") && lowerQuestion.contains("group")) {
            return responseMap.get("how to create a group");
        }
        if (lowerQuestion.contains("find") && (lowerQuestion.contains("peer") || lowerQuestion.contains("partner"))) {
            return responseMap.get("find peers");
        }
        if (lowerQuestion.contains("password") || lowerQuestion.contains("reset")) {
            return responseMap.get("reset password");
        }
        if (lowerQuestion.contains("profile") || lowerQuestion.contains("update")) {
            return responseMap.get("update profile");
        }
        if (lowerQuestion.contains("how") && lowerQuestion.contains("use")) {
            return responseMap.get("how to use platform");
        }
        if (lowerQuestion.contains("navigate") || lowerQuestion.contains("navigation")) {
            return responseMap.get("navigation help");
        }

        return responseMap.get("default");
    }

    public Map<String, Object> getChatAnalytics() {
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);

        Long totalInteractions = interactionRepository.count();
        Long weeklyInteractions = interactionRepository.countInteractionsBetween(weekAgo, LocalDateTime.now());
        Long todayInteractions = interactionRepository.countInteractionsBetween(todayStart, LocalDateTime.now());

        List<Map<String, Object>> frequentQuestions = interactionRepository.findFrequentQuestionsSince(weekAgo);
        List<Map<String, Object>> interactionsByType = interactionRepository.countInteractionsByType();

        Map<String, Object> analytics = new HashMap<>();
        analytics.put("totalInteractions", totalInteractions);
        analytics.put("weeklyInteractions", weeklyInteractions);
        analytics.put("todayInteractions", todayInteractions);
        analytics.put("frequentQuestions", frequentQuestions);
        analytics.put("interactionsByType", interactionsByType);
        analytics.put("responseCoverage", calculateResponseCoverage());

        return analytics;
    }

    public List<Map<String, Object>> getCommonQuestions() {
        List<Map<String, Object>> commonQuestions = new ArrayList<>();

        responseMap.forEach((question, answer) -> {
            if (!question.equals("default")) {
                Map<String, Object> qa = new HashMap<>();
                qa.put("question", question);
                qa.put("answerPreview", answer.substring(0, Math.min(100, answer.length())) + "...");
                qa.put("category", getQuestionCategory(question));
                commonQuestions.add(qa);
            }
        });

        return commonQuestions;
    }

    private String getQuestionCategory(String question) {
        if (question.contains("group")) return "Group Management";
        if (question.contains("course")) return "Course System";
        if (question.contains("peer") || question.contains("partner")) return "Networking";
        if (question.contains("password") || question.contains("profile")) return "Account Management";
        if (question.contains("how to use") || question.contains("navigation")) return "Platform Help";
        return "General Help";
    }

    private double calculateResponseCoverage() {
        LocalDateTime monthAgo = LocalDateTime.now().minusDays(30);
        List<Map<String, Object>> frequentQuestions = interactionRepository.findFrequentQuestionsSince(monthAgo);

        long coveredInteractions = 0;
        long totalInteractions = 0;

        for (Map<String, Object> entry : frequentQuestions) {
            String question = (String) entry.get("question");
            Long count = (Long) entry.get("count");
            totalInteractions += count;

            if (responseMap.containsKey(question.toLowerCase())) {
                coveredInteractions += count;
            }
        }

        return totalInteractions > 0 ? (double) coveredInteractions / totalInteractions : 1.0;
    }
}