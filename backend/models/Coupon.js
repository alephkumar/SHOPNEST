const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    discountType: { type: String, enum: ['percentage', 'flat'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number }, // caps percentage discounts
    expiresAt: { type: Date, required: true },
    usageLimit: { type: Number, default: 100 },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.methods.isValid = function (orderValue) {
  if (!this.isActive) return { valid: false, message: 'Coupon is inactive' };
  if (this.expiresAt < new Date()) return { valid: false, message: 'Coupon has expired' };
  if (this.usedCount >= this.usageLimit)
    return { valid: false, message: 'Coupon usage limit reached' };
  if (orderValue < this.minOrderValue)
    return {
      valid: false,
      message: `Minimum order value of ${this.minOrderValue} required`,
    };
  return { valid: true };
};

couponSchema.methods.calculateDiscount = function (orderValue) {
  let discount =
    this.discountType === 'percentage'
      ? (orderValue * this.discountValue) / 100
      : this.discountValue;
  if (this.maxDiscountAmount) discount = Math.min(discount, this.maxDiscountAmount);
  return Math.min(discount, orderValue);
};

module.exports = mongoose.model('Coupon', couponSchema);
