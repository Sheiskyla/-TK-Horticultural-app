const { Slot, Availability } = require('../models');
const { Op } = require('sequelize');

class SlotController {
  constructor() {
    this.slotLabels = {
      'slot-1': '9am–12pm',
      'slot-2': '12pm–3pm',
      'slot-3': '3pm–6pm'
    };
  }

  async availability(req, res) {
    try {
      let dateParam = req.query.date;
      if (!dateParam) {
        const today = new Date();
        dateParam = today.toISOString().split('T')[0]; // YYYY-MM-DD
      }

      // Validate date
      const parsedDate = new Date(dateParam);
      if (isNaN(parsedDate.getTime())) {
        return res.status(422).json({ message: 'Invalid date format.' });
      }
      const dateString = parsedDate.toISOString().split('T')[0];

      // Get overrides
      const override = await Availability.findOne({ where: { kind: 'date', key: dateString } });
      const weekday = parsedDate.getUTCDay(); // 0-6 Sunday-Saturday (JS getDay returns 0 for Sunday, 6 for Saturday)
      const defaultOverride = await Availability.findOne({ where: { kind: 'weekday', key: weekday.toString() } });

      // Get slots for this date
      const slots = await Slot.findAll({
        where: { date: dateString, slot_id: { [Op.in]: Object.keys(this.slotLabels) } }
      });
      const slotsMap = {};
      slots.forEach(slot => {
        slotsMap[slot.slot_id] = slot;
      });

      const result = [];
      for (const [slotId, label] of Object.entries(this.slotLabels)) {
        const slot = slotsMap[slotId];
        let status = 'Available';
        // Check overrides
        if ((override && !override.is_available) || (defaultOverride && !defaultOverride.is_available)) {
          status = 'Blocked';
        }
        if (slot) {
          status = slot.status === 'booked' ? 'Booked' :
                   slot.status === 'blocked' ? 'Blocked' : 'Available';
        }
        result.push({
          id: slotId,
          time: label,
          status,
          available: status === 'Available'
        });
      }

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async monthAvailability(req, res) {
    try {
      let monthParam = req.query.month;
      let yearParam = req.query.year;
      let year, month;

      if (monthParam && monthParam.includes('-')) {
        const parsed = new Date(monthParam);
        year = parsed.getFullYear();
        month = parsed.getMonth() + 1; // JS month 0-11
      } else {
        year = parseInt(yearParam) || new Date().getFullYear();
        month = parseInt(monthParam) || new Date().getMonth() + 1;
      }

      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0); // last day of month

      const startString = startDate.toISOString().split('T')[0];
      const endString = endDate.toISOString().split('T')[0];

      const slots = await Slot.findAll({
        where: {
          date: {
            [Op.between]: [startString, endString]
          },
          slot_id: { [Op.in]: Object.keys(this.slotLabels) }
        }
      });

      // Group by date
      const grouped = {};
      slots.forEach(slot => {
        const date = slot.date;
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(slot);
      });

      const result = {};
      const totalSlots = Object.keys(this.slotLabels).length;
      for (const [date, daySlots] of Object.entries(grouped)) {
        const bookedCount = daySlots.filter(s => s.status === 'booked').length;
        result[date] = {
          date,
          booked: bookedCount,
          total: totalSlots,
          full: bookedCount >= totalSlots
        };
      }

      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateDateAvailability(req, res) {
    try {
      // Admin middleware should be applied before this controller
      const { date } = req.params;
      const { is_available, slots } = req.body;

      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(422).json({ message: 'Invalid date' });
      }
      const dateString = parsedDate.toISOString().split('T')[0];

      const [availability] = await Availability.upsert({
        kind: 'date',
        key: dateString,
        is_available: !!is_available,
        slots: slots || null
      }, { returning: true });

      res.json(availability);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async adminAvailability(req, res) {
    try {
      const { date } = req.params;
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(422).json({ message: 'Invalid date' });
      }
      const dateString = parsedDate.toISOString().split('T')[0];
      const weekday = parsedDate.getUTCDay();

      const dateOverride = await Availability.findOne({ where: { kind: 'date', key: dateString } });
      const weekdayOverride = await Availability.findOne({ where: { kind: 'weekday', key: weekday.toString() } });

      res.json({
        date: dateOverride,
        weekday: weekdayOverride
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateDefaultAvailability(req, res) {
    try {
      // Admin middleware
      const { weekday } = req.params;
      const weekdayInt = parseInt(weekday);
      if (isNaN(weekdayInt) || weekdayInt < 0 || weekdayInt > 6) {
        return res.status(422).json({ message: 'Invalid weekday' });
      }

      const { is_available, slots } = req.body;

      const [availability] = await Availability.upsert({
        kind: 'weekday',
        key: weekdayInt.toString(),
        is_available: !!is_available,
        slots: slots || null
      }, { returning: true });

      res.json(availability);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async updateSlot(req, res) {
    try {
      // Admin middleware
      const { date, slotId } = req.params;
      if (!this.slotLabels[slotId]) {
        return res.status(422).json({ message: 'Invalid slot' });
      }

      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(422).json({ message: 'Invalid date' });
      }
      const dateString = parsedDate.toISOString().split('T')[0];

      const { status, notes } = req.body;

      const [slot] = await Slot.upsert({
        date: dateString,
        slot_id: slotId,
        status: status || 'available',
        notes: notes || null
      }, { returning: true });

      res.json(slot);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = { SlotController: new SlotController() };