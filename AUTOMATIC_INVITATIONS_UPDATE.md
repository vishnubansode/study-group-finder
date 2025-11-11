# Automatic Session Invitations Update

## Overview
The session creation flow has been updated to **automatically send invitations to ALL group members** when a session is created.

## What Changed

### Before
- Standard session creation only sent general notifications to group members
- Members were notified but had no way to accept/decline
- No participation tracking for standard sessions
- Only sessions created via `/api/sessions/invitations/create` had invitation functionality

### After
- **All sessions automatically send invitations to all group members (except creator)**
- Members receive INVITATION notifications they can accept/decline
- Full participation tracking for all sessions
- Consistent experience across all session creation methods

## Updated Behavior

### Standard Session Creation
**Endpoint:** `POST /api/sessions/group/{groupId}/creator/{createdById}`

**New Flow:**
1. User creates a session in a group
2. Session is validated and saved to database
3. System retrieves **all group members**
4. System filters out the creator (no self-invitation)
5. System automatically creates **SessionInvitation** records for all remaining members
6. System sends **INVITATION** notifications to all invited members
7. Members see invitations in their notification viewer with Accept/Decline buttons

**Example:**
```java
// When a session is created
Session session = createSession(groupId, creatorId, sessionData);

// System automatically:
// 1. Finds all group members: [User1, User2, User3, Creator]
// 2. Filters creator: [User1, User2, User3]
// 3. Creates invitations for: User1, User2, User3
// 4. Sends INVITATION notifications to: User1, User2, User3
```

### Selective Invitation Creation (Still Available)
**Endpoint:** `POST /api/sessions/invitations/create`

Use this when you want to invite only **specific members** instead of the entire group:
- Create session with explicit list of user IDs
- Only selected members receive invitations
- Useful for sub-group sessions or specialized meetings

## Code Changes

### SessionService.java

**Added Import:**
```java
import com.groupgenius.groupgenius_backend.entity.GroupMember;
import com.groupgenius.groupgenius_backend.repository.GroupMemberRepository;
import java.util.stream.Collectors;
```

**Added Dependency:**
```java
private final GroupMemberRepository groupMemberRepository;
```

**Updated `createSession` Method:**
```java
public SessionResponseDTO createSession(Long groupId, Long createdById, SessionRequestDTO requestDTO) {
    // ... existing validation and session creation ...
    
    Session saved = sessionRepository.save(session);
    log.info("📅 Session created: {} in group {}", saved.getTitle(), group.getGroupName());

    // NEW: Get all group members except the creator and send invitations
    List<GroupMember> groupMembers = groupMemberRepository.findByGroup(group);
    List<Long> memberIds = groupMembers.stream()
            .map(gm -> gm.getUser().getId())
            .filter(userId -> !userId.equals(createdById)) // Exclude creator
            .collect(Collectors.toList());

    if (!memberIds.isEmpty()) {
        invitationService.createInvitations(saved, memberIds);
        log.info("📨 Sent {} invitations for session: {}", memberIds.size(), saved.getTitle());
    } else {
        log.info("ℹ️ No other members in group to invite for session: {}", saved.getTitle());
    }

    return SessionMapper.toDTO(saved);
}
```

## Benefits

### For Users
✅ **Consistent Experience**: All sessions now have invitation system
✅ **Better Tracking**: Know who accepted/declined for every session
✅ **No Extra Steps**: Automatic invitations without manual selection
✅ **Clear RSVP**: Accept/decline directly from notification viewer

### For Developers
✅ **Unified Flow**: Single invitation system for all sessions
✅ **Participation Data**: Full participant tracking across all sessions
✅ **Notification Integration**: Seamless notification viewer integration
✅ **Audit Trail**: Complete history of invitations and responses

## User Experience

### Creating a Session
1. User navigates to Calendar or Group page
2. Clicks "Create Session" button
3. Fills in session details (title, description, time, meeting link)
4. Clicks "Create"
5. **System automatically invites all group members**

### Receiving an Invitation
1. Member receives notification (bell icon shows unread count)
2. Clicks bell icon to open notification viewer
3. Sees invitation in "All" or "Invites" tab
4. Can immediately "Accept" or "Decline"
5. Accepting creates participant record and notifies creator
6. Declining notifies creator of non-participation

### Viewing Participation
1. Session creator can see who accepted/declined
2. Creator receives ACCEPTED/DECLINED notifications
3. Participant list shows all who joined
4. Calendar shows different states (invited, accepted, created)

## API Endpoints

### Session Creation (Auto-invites all members)
```http
POST /api/sessions/group/{groupId}/creator/{createdById}
Content-Type: application/json

{
  "title": "Study Session",
  "description": "Review for midterm",
  "startTime": "2025-11-15T14:00:00",
  "endTime": "2025-11-15T16:00:00",
  "meetingLink": "https://meet.example.com/abc"
}
```

### Invitation Response Endpoints
```http
POST /api/sessions/invitations/{invitationId}/accept?userId={userId}
POST /api/sessions/invitations/{invitationId}/decline?userId={userId}
```

### View Invitations
```http
GET /api/sessions/invitations/user/{userId}/pending
GET /api/notifications/user/{userId}
```

## Database Impact

### Tables Involved
- **sessions**: Session records
- **session_invitations**: One record per invited member
- **session_participants**: Created when invitation is accepted
- **notifications**: INVITATION, ACCEPTED, DECLINED notifications

### Example Flow Database Changes

**When Session is Created:**
```sql
-- 1 session record
INSERT INTO sessions (group_id, title, start_time, end_time, created_by)
VALUES (1, 'Study Session', '2025-11-15 14:00:00', '2025-11-15 16:00:00', 123);

-- 3 invitation records (for 3 group members)
INSERT INTO session_invitations (session_id, user_id, status)
VALUES (1, 101, 'PENDING'), (1, 102, 'PENDING'), (1, 103, 'PENDING');

-- 3 notifications
INSERT INTO notifications (user_id, session_id, type, message)
VALUES 
  (101, 1, 'INVITATION', 'You have been invited to "Study Session"'),
  (102, 1, 'INVITATION', 'You have been invited to "Study Session"'),
  (103, 1, 'INVITATION', 'You have been invited to "Study Session"');
```

**When User Accepts:**
```sql
-- Update invitation
UPDATE session_invitations SET status = 'ACCEPTED', responded_at = NOW()
WHERE id = 1;

-- Create participant
INSERT INTO session_participants (session_id, user_id)
VALUES (1, 101);

-- Notify creator
INSERT INTO notifications (user_id, session_id, type, message)
VALUES (123, 1, 'ACCEPTED', 'John Doe has accepted your invitation to "Study Session"');
```

## Testing Checklist

### Backend Tests
- [ ] Session creation sends invitations to all group members
- [ ] Creator is excluded from invitations
- [ ] Invitation count matches (group members - 1)
- [ ] INVITATION notifications are created
- [ ] Accept invitation creates participant record
- [ ] Decline invitation updates status
- [ ] ACCEPTED/DECLINED notifications sent to creator

### Frontend Tests
- [ ] Create session through standard flow
- [ ] Verify other group members receive notifications
- [ ] Notification viewer shows invitation with Accept/Decline buttons
- [ ] Accept button joins session
- [ ] Decline button removes invitation
- [ ] Notification badge count updates correctly
- [ ] Calendar shows different session states

### Integration Tests
- [ ] Group with 1 member (creator only) - no invitations sent
- [ ] Group with 2 members - 1 invitation sent
- [ ] Group with multiple members - correct count
- [ ] Member accepts - creator receives ACCEPTED notification
- [ ] Member declines - creator receives DECLINED notification
- [ ] Participant list shows accepted members only

## Migration Notes

### Existing Sessions
- Existing sessions created before this update will NOT have invitations
- Only new sessions created after deployment will auto-invite
- Consider running a migration script if you want to create invitations for existing future sessions

### Backward Compatibility
- All existing API endpoints remain functional
- Selective invitation endpoint still available for specific use cases
- No breaking changes to frontend components

## Future Enhancements

1. **Configurable Auto-Invite**: Allow group admins to disable auto-invitations for specific groups
2. **Invitation Templates**: Pre-defined invitation messages with group context
3. **Reminder System**: Automated reminders 24h before session for accepted participants
4. **Waitlist System**: Allow more users to express interest when session is full
5. **Calendar Sync**: Export accepted sessions to Google Calendar, Outlook, etc.

## Summary

This update creates a **seamless invitation experience** where every session automatically includes all group members, ensuring better participation tracking and communication. Users no longer need to manually select members for group-wide sessions, while still having the option for selective invitations when needed.

**Key Benefit**: Every session is now trackable with accept/decline functionality, providing better insights into attendance and engagement across all study groups.
