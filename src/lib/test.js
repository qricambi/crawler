const exchange_symbol = /[\$\£\€]/g

module.exports.parseFloat = function(numb_to_check) {
  if(exchange_symbol.exec(numb_to_check)!== null)
    return NaN
  return parseFloat(numb_to_check)
}