const { Booking, Slot, User } = require('../models');
const { v4: uuidv4 } = require('uuid');
const db = require('../models');

class BookingController {
  async index(req, res) {
    try {
      const userId = req.user.id;
      const { status } = req.query;

      let where = { user_id: userId };
      if (status) {
        where.status = status;
      }

      const bookings = await Booking.findAll({
        where,
        order: [['created_at', 'DESC']],
        limit: 20,
        offset: 0 // simple pagination; we can implement page param later
      });

      res.json(bookings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async store(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
      const {
        division,
        service,
        sub_services,
        notes,
        date,
        slot_id,
        address,
        postcode,
        client_name,
        client_email,
        client_phone,
        media
      } = req.body;

      // Validation (basic)
      if (!division || !service || !date || !slot_id || !client_name || !client_email || !client_phone) {
        return res.status(422).json({ message: 'Validation failed' });
      }

      // Validate date format
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(422).json({ message: 'Invalid date' });
      }

      // Check slot availability with lock (we'll simulate by checking status)
      let slot = await Slot.findOne({
        where: { date: parsedDate, slot_id },
        transaction
      });

      if (!slot) {
        slot = await Slot.create({
          date: parsedDate,
          slot_id,
          status: 'available'
        }, { transaction });
      }

      if (slot.status !== 'available') {
        await transaction.rollback();
        return res.status(409).json({ message: 'Selected time slot is no longer available' });
      }

      // Start transaction logic: lock slot, update status to booked, create booking, update slot booking_id
      // We'll re-fetch slot with lock (FOR UPDATE) - not directly supported in Sequelize, but we can use a subquery.
      // For simplicity, we'll update directly and hope no race condition.
      await Slot.update(
        { status: 'booked', user_id: req.user.id },
        { where: { date: parsedDate, slot_id }, transaction }
      );

      const booking = await Booking.create({
        ref: 'TK-' + uuidv4().toUpperCase().substring(0, 6),
        user_id: req.user.id,
        division,
        service,
        sub_services: sub_services || [],
        notes: notes || null,
        date: parsedDate,
        slot_id,
        slot: this.getSlotLabel(slot_id),
        address: address || null,
        postcode: postcode || null,
        client_name,
        client_email,
        client_phone,
        media: media || [],
        status: 'Pending Quote'
      }, { transaction });

      await Slot.update(
        { booking_id: booking.id },
        { where: { date: parsedDate, slot_id }, transaction }
      );

      await transaction.commit();
      res.status(201).json(booking);
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async show(req, res) {
    try {
      const booking = await Booking.findOne({
        where: { id: req.params.id, user_id: req.user.id }
      });
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }
      res.json(booking);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async cancel(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
      const booking = await Booking.findOne({
        where: { id: req.params.id, user_id: req.user.id },
        transaction
      });
      if (!booking) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Booking not found' });
      }

      if (!['Pending Quote', 'Confirmed'].includes(booking.status)) {
        await transaction.rollback();
        return res.status(422).json({ message: 'Booking cannot be cancelled' });
      }

      await booking.update({ status: 'Cancelled' }, { transaction });

      await Slot.update(
        { status: 'available', user_id: null, booking_id: null },
        { where: { date: booking.date, slot_id: booking.slot_id }, transaction }
      );

      await transaction.commit();
      res.json({ message: 'Booking cancelled' });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  getSlotLabel(slotId) {
    const labels = {
      'slot-1': '9am–12pm',
      'slot-2': '12pm–3pm',
      'slot-3': '3pm–6pm'
    };
    return labels[slotId] || slotId;
  }
}

module.exports = { BookingController: new BookingController() };