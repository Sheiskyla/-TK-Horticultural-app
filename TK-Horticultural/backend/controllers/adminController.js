const { Booking, Enquiry, User, Slot } = require('../models');
const { Op } = require('sequelize');

class AdminController {
  async dashboard(req, res) {
    try {
      // Admin middleware ensures req.user.is_admin is true
      const totalBookings = await Booking.count();
      const pendingQuotes = await Booking.count({ where: { status: 'Pending Quote' } });
      const confirmedBookings = await Booking.count({ where: { status: 'Confirmed' } });
      const completedBookings = await Booking.count({ where: { status: 'Completed' } });
      const cancelledBookings = await Booking.count({ where: { status: 'Cancelled' } });

      // Total revenue: sum of price for Confirmed and Completed bookings
      const revenueBookings = await Booking.findAll({
        where: { status: { [Op.in]: ['Confirmed', 'Completed'] } },
        attributes: ['price']
      });
      let totalRevenue = 0;
      revenueBookings.forEach(b => {
        const priceStr = b.price || '0';
        const numeric = parseFloat(priceStr.replace(/[£,]/g, ''));
        if (!isNaN(numeric)) {
          totalRevenue += numeric;
        }
      });

      const divisionStats = {
        horticulture: await Booking.count({ where: { division: 'horticulture' } }),
        cleaning: await Booking.count({ where: { division: 'cleaning' } }),
        waste: await Booking.count({ where: { division: 'waste' } })
      };

      const upcomingSlots = await Slot.findAll({
        where: {
          date: { [Op.gte]: new Date().toISOString().split('T')[0] },
          status: 'booked'
        },
        include: [{ model: Booking, as: 'booking' }],
        order: [['date', 'ASC']],
        limit: 10
      });

      res.json({
        admin: {
          name: req.user.name,
          email: req.user.email
        },
        stats: {
          total_bookings: totalBookings,
          pending_quotes: pendingQuotes,
          confirmed_bookings: confirmedBookings,
          completed_bookings: completedBookings,
          cancelled_bookings: cancelledBookings,
          total_revenue: '£' + totalRevenue.toFixed(2),
          division_stats: divisionStats
        },
        upcoming_slots: upcomingSlots
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async bookings(req, res) {
    try {
      let where = {};
      const { status, division, search } = req.query;

      if (status && status !== 'all') {
        where.status = status;
      }
      if (division && division !== 'all') {
        where.division = division;
      }
      if (search) {
        where = {
          ...where,
          [Op.or]: [
            { client_name: { [Op.like]: `%${search}%` } },
            { client_email: { [Op.like]: `%${search}%` } },
            { ref: { [Op.like]: `%${search}%` } },
            { address: { [Op.like]: `%${search}%` } },
            { service: { [Op.like]: `%${search}%` } }
          ]
        };
      }

      const bookings = await Booking.findAll({
        where,
        include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
        order: [['created_at', 'DESC']],
        limit: 20,
        offset: 0
      });

      res.json(bookings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateBookingStatus(req, res) {
    try {
      const booking = await Booking.findByPk(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      const { status, price, admin_notes } = req.body;

      // Validate status
      const allowedStatuses = ['Pending Quote', 'Approved', 'Confirmed', 'Declined', 'Completed', 'Cancelled'];
      if (!allowedStatuses.includes(status)) {
        return res.status(422).json({ message: 'Invalid status' });
      }

      await booking.update({
        status,
        price: price !== undefined ? price : booking.price,
        admin_notes: admin_notes !== undefined ? admin_notes : booking.admin_notes
      });

      // If status is Declined or Cancelled, release slot
      if (['Declined', 'Cancelled'].includes(status)) {
        await Slot.update(
          { status: 'available', user_id: null, booking_id: null },
          { where: { date: booking.date, slot_id: booking.slot_id } }
        );
      }

      res.json(booking);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async destroyBooking(req, res) {
    try {
      const booking = await Booking.findByPk(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Release slot
      await Slot.update(
        { status: 'available', user_id: null, booking_id: null },
        { where: { booking_id: booking.id } }
      );

      await booking.destroy();
      res.json({ message: 'Booking deleted' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async enquiries(req, res) {
    try {
      let where = {};
      const { status } = req.query;
      if (status && status !== 'all') {
        where.status = status;
      }

      const enquiries = await Enquiry.findAll({
        where,
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
          { model: Booking, as: 'booking', attributes: ['id', 'ref'] }
        ],
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

  async updateEnquiryStatus(req, res) {
    try {
      const enquiry = await Enquiry.findByPk(req.params.id);
      if (!enquiry) {
        return res.status(404).json({ message: 'Enquiry not found' });
      }

      const { status, admin_notes } = req.body;
      const allowedStatuses = ['new', 'replied', 'closed'];
      if (!allowedStatuses.includes(status)) {
        return res.status(422).json({ message: 'Invalid status' });
      }

      await enquiry.update({
        status,
        admin_notes: admin_notes !== undefined ? admin_notes : enquiry.admin_notes
      });

      res.json(enquiry);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async destroyEnquiry(req, res) {
    try {
      const enquiry = await Enquiry.findByPk(req.params.id);
      if (!enquiry) {
        return res.status(404).json({ message: 'Enquiry not found' });
      }
      await enquiry.destroy();
      res.json({ message: 'Enquiry deleted' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async services(req, res) {
    try {
      const services = {
        horticulture: {
          name: 'Horticulture & Gardening',
          icon: 'leaf',
          description: 'Lawn mowing, fencing, paver laying & hedge care.',
          rate: 'From £45.00'
        },
        cleaning: {
          name: 'Cleaning Services',
          icon: 'sparkles',
          description: 'Pressure jet washing, carpet care & deep cleaning.',
          rate: 'From £60.00'
        },
        waste: {
          name: 'Rubbish & Waste Clearance',
          icon: 'trash-2',
          description: 'Environment Agency licensed eco-friendly disposal.',
          rate: 'From £55.00'
        }
      };
      res.json(services);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async users(req, res) {
    try {
      let where = {};
      const { search, role } = req.query;

      if (search) {
        where = {
          [Op.or]: [
            { name: { [Op.like]: `%${search}%` } },
            { email: { [Op.like]: `%${search}%` } },
            { phone: { [Op.like]: `%${search}%` } }
          ]
        };
      }
      if (role && role !== 'all') {
        const isAdmin = role === 'admin';
        where.is_admin = isAdmin;
      }

      const users = await User.findAll({
        where,
        attributes: ['id', 'name', 'email', 'phone', 'address', 'postcode', 'is_admin', 'email_verified_at', 'created_at', 'updated_at'],
        order: [['created_at', 'DESC']],
        limit: 50,
        offset: 0
      });

      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateUser(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { name, email, phone, address, postcode, is_admin } = req.body;

      // Validate email uniqueness if changed
      if (email && email !== user.email) {
        const existing = await User.findOne({ where: { email } });
        if (existing) {
          return res.status(422).json({ message: 'Email already exists' });
        }
      }

      await user.update({
        name: name !== undefined ? name : user.name,
        email: email !== undefined ? email : user.email,
        phone: phone !== undefined ? phone : user.phone,
        address: address !== undefined ? address : user.address,
        postcode: postcode !== undefined ? postcode : user.postcode,
        is_admin: is_admin !== undefined ? is_admin : user.is_admin
      });

      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async destroyUser(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Prevent deleting own account
      if (req.user.id === user.id) {
        return res.status(403).json({ message: 'You cannot delete your own account.' });
      }

      // TODO: delete tokens (if we had a token table)
      // For now, just delete user
      await user.destroy();
      res.json({ message: 'User deleted.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = { AdminController: new AdminController() };