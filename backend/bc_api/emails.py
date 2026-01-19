"""
Email notification utilities for BC Coffee Chat.
"""
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string


def send_match_notification(match):
    """Send email notification when a new match is created."""
    applicant = match.applicant
    bc_member = match.bc_member

    # Email to applicant
    if applicant.user.email:
        subject = "BC Coffee Chat - You have a match!"
        message = f"""
Hi {applicant.user.name or 'there'},

Great news! You've been matched with {bc_member.user.name} for a coffee chat.

{bc_member.user.name} is a {bc_member.year} studying {bc_member.major} and has been in BC for {bc_member.semesters_in_bc} semester(s).

Note: This match is pending confirmation from the BC admin. You'll receive another email once it's confirmed and you can start chatting.

Best,
BC Coffee Chat Team
        """
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [applicant.user.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send match notification to applicant: {e}")

    # Email to BC member
    if bc_member.user.email:
        subject = "BC Coffee Chat - New coffee chat request!"
        message = f"""
Hi {bc_member.user.name or 'there'},

You have a new coffee chat match with {applicant.user.name}!

{applicant.user.name} is a {applicant.role} who is interested in joining BC.

Why they want to join BC:
{applicant.why_bc}

Note: This match is pending confirmation from the BC admin. You'll receive another email once it's confirmed and you can start chatting.

Best,
BC Coffee Chat Team
        """
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [bc_member.user.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send match notification to BC member: {e}")


def send_match_confirmed_notification(match):
    """Send email when admin confirms a match."""
    applicant = match.applicant
    bc_member = match.bc_member

    # Email to applicant
    if applicant.user.email:
        subject = "BC Coffee Chat - Your match is confirmed!"
        message = f"""
Hi {applicant.user.name or 'there'},

Your coffee chat with {bc_member.user.name} has been confirmed by the admin!

You can now message each other to schedule your coffee chat. Log in to the app to start the conversation.

Best,
BC Coffee Chat Team
        """
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [applicant.user.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send confirmation to applicant: {e}")

    # Email to BC member
    if bc_member.user.email:
        subject = "BC Coffee Chat - Match confirmed!"
        message = f"""
Hi {bc_member.user.name or 'there'},

Your coffee chat with {applicant.user.name} has been confirmed!

You can now message each other to schedule your coffee chat. Log in to the app to start the conversation.

Best,
BC Coffee Chat Team
        """
        try:
            send_mail(
                subject,
                message,
                settings.DEFAULT_FROM_EMAIL,
                [bc_member.user.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send confirmation to BC member: {e}")


def send_new_message_notification(message):
    """Send email notification for new messages."""
    match = message.match
    sender = message.sender

    # Determine recipient
    if match.applicant.user == sender:
        recipient = match.bc_member.user
    else:
        recipient = match.applicant.user

    if recipient.email:
        subject = f"BC Coffee Chat - New message from {sender.name}"
        message_text = f"""
Hi {recipient.name or 'there'},

You have a new message from {sender.name}:

"{message.content[:200]}{'...' if len(message.content) > 200 else ''}"

Log in to the app to reply.

Best,
BC Coffee Chat Team
        """
        try:
            send_mail(
                subject,
                message_text,
                settings.DEFAULT_FROM_EMAIL,
                [recipient.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Failed to send message notification: {e}")
