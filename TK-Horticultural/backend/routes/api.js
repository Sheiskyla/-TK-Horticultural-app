const express = require('express');
const router = express.Router();

const { AuthController, authMiddleware, adminMiddleware } = require('../controllers/authController');
const { BookingController } = require('../controllers/bookingController');
const { EnquiryController } = require('../controllers/enquiryController');
const { GalleryController } = require('../controllers/galleryController');
const { ProfileController } = require('../controllers/profileController');
const { SlotController } = require('../controllers/slotController');
const { AdminController } = require('../controllers/adminController');
const { UploadController } = require('../controllers/uploadController');

// Auth routes
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/google/login', AuthController.googleLogin);
router.post('/logout', authMiddleware, AuthController.logout);
router.get('/me', authMiddleware, AuthController.me);

// Profile routes
router.get('/profile', authMiddleware, ProfileController.show);
router.put('/profile', authMiddleware, ProfileController.update);

// Gallery routes (public)
router.get('/gallery', GalleryController.index);

// Slot routes (public)
router.get('/slots/availability', SlotController.availability);
router.get('/slots/month', SlotController.monthAvailability);

// Protected routes (auth required)
router.use(authMiddleware);

// Profile (already covered)
router.get('/profile', ProfileController.show);
router.put('/profile', ProfileController.update);

// Booking routes
router.get('/bookings', BookingController.index);
router.post('/bookings', BookingController.store);
router.get('/bookings/:id', BookingController.show);
router.post('/bookings/:id/cancel', BookingController.cancel);

// Enquiry routes
router.get('/enquiries', EnquiryController.index);
router.post('/enquiries', EnquiryController.store);

// Upload route
router.post('/upload', UploadController.store);

// Admin routes (auth + admin)
router.use(adminMiddleware);
router.get('/admin/dashboard', AdminController.dashboard);
router.get('/admin/bookings', AdminController.bookings);
router.put('/admin/bookings/:id', AdminController.updateBookingStatus);
router.delete('/admin/bookings/:id', AdminController.destroyBooking);
router.get('/admin/enquiries', AdminController.enquiries);
router.put('/admin/enquiries/:id', AdminController.updateEnquiryStatus);
router.delete('/admin/enquiries/:id', AdminController.destroyEnquiry);
router.get('/admin/services', AdminController.services);
router.get('/admin/users', AdminController.users);
router.put('/admin/users/:id', AdminController.updateUser);
router.delete('/admin/users/:id', AdminController.destroyUser);
router.get('/admin/gallery', GalleryController.adminIndex);
router.post('/admin/gallery', GalleryController.store);
router.post('/admin/gallery/:id', GalleryController.update); // POST method for update
router.delete('/admin/gallery/:id', GalleryController.destroy);
router.put('/admin/availability/:date', SlotController.updateDateAvailability);
router.get('/admin/availability/:date', SlotController.adminAvailability);
router.put('/admin/availability-defaults/:weekday', SlotController.updateDefaultAvailability);
router.put('/admin/slots/:date/:slotId', SlotController.updateSlot);

module.exports = router;