const { DataTypes } = require('sequelize');
const bcrypt = require('bcrypt'); // Make sure bcryptjs is used if you installed that instead of bcrypt

module.exports = (sequelize) => {
  const Admin = sequelize.define('Admin', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        len: {
          args: [4, 20],
          msg: 'Username must be between 4 and 20 characters',
        },
        notEmpty: {
          msg: 'Username cannot be empty',
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isStrong(value) {
          const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
          if (!regex.test(value)) {
            throw new Error(
              'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character.'
            );
          }
        },
      },
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'admin',
      validate: {
        isIn: {
          args: [['admin']], // Correctly limits role to 'admin'
          msg: 'Role must be one of: admin', // Adjusted message
        },
      },
    },
  }, {
    hooks: {
      beforeCreate: async (admin) => {
        admin.password = await bcrypt.hash(admin.password, 10);
      },
      beforeUpdate: async (admin) => {
        if (admin.changed('password')) {
          admin.password = await bcrypt.hash(admin.password, 10);
        }
      },
    },
    timestamps: true,
  });

  // Instance method to compare password
  Admin.prototype.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  return Admin;
};