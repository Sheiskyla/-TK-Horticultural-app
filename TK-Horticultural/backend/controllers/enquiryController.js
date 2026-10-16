const { Enquiry } = require('../models');

class EnquiryController {
  async store(req, res) {
    try {
      const { name, email, phone, service, message, media, booking_id } = req.body;

      // Validation
      if (!name || !email || !message) {
        return res.status(422).json({ message: 'Validation failed' });
      }

      const enquiry = await Enquiry.create({
        user_id: req.user.id,
        booking_id: booking_id || null,
        name,
        email,
        phone: phone || null,
        service: service || null,
        message,
        media: media || [],
        status: 'new'
      });

      res.status(201).json(enquiry);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async index(req, res) {
    try {
      const userId = req.user.id;
      const enquiries = await Enquiry.findAll({
        where: { user_id: userId },
        order: [['created_at', 'DESC']],
        limit: 20,
        offset: 0
      });
      res.json(enquiries);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = { EnquiryController: new EnquiryController() };