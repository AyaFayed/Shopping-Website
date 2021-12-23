const config = require('./config');

class Cart {
   constructor() {
      this.data.items = [];
      this.data.total = 0;
   }

   InCart (prdID = 0) {
    let flag = false;
    this.data.items.forEach(item => {
       if(item.id === prdID) {
           flag = true;
       }
    });
        return flag;
    };

   calculateTotals() {
    this.data.totals = 0;
    this.data.items.forEach(item => {
        let price = item.price;
        let qty = item.qty;
        let amount = price * qty;
        this.data.totals += amount;
    });
    this.setFormattedTotals();
}
}

module.exports = new Cart();


