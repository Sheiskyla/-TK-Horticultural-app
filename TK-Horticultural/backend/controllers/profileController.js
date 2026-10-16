const { User } = require('../models');
const bcrypt = require('bcryptjs');

class ProfileController {
  async show(req, res) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password', 'remember_token'] }
      });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }

  async update(req, res) {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const { name, phone, address, postcode, current_password, password } = req.body;

      // Validation
      if (!name && !phone && !address && !postcode && !current_password && !password) {
        return res.status(422).json({ message: 'No fields to update' });
      }

      if (current_password) {
        if (!password) {
          return res.status(422).json({ message: 'Password confirmation required' });
        }
        const isMatch = await bcrypt.compare(current_password, user.password);
        if (!isMatch) {
          return res.status(422).json({ message: 'Current password is incorrect' });
        }
        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
      }

      // Update fields
      if (name !== undefined) user.name = name;
      if (phone !== undefined) user.phone = phone;
      if (address !== undefined) user.address = address;
      if (postcode !== undefined) user.postcode = postcode;

      await user.save();

      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        postcode: user.postcode,
        is_admin: user.is_admin
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
}

module.exports = { ProfileController: new ProfileController() };