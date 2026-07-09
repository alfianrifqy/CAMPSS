from django.test import TestCase
from django.contrib.auth.models import User
from apps.accounts.models import Profile

class ProfileModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="testuser", 
            email="test@test.com", 
            password="password123"
        )
        self.profile = Profile.objects.create(
            user=self.user,
            full_name="Test User",
            phone="08123456789",
            role="HIKER"
        )

    def test_profile_creation(self):
        """Test apakah profil berhasil dibuat dan terhubung ke User"""
        self.assertEqual(self.profile.full_name, "Test User")
        self.assertEqual(self.profile.user.username, "testuser")
        self.assertEqual(self.profile.role, "HIKER")

    def test_profile_string_representation(self):
        """Test fungsi __str__ pada model Profile"""
        self.assertEqual(str(self.profile), "Test User")
