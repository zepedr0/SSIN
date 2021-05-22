const squareRoot = (req, res) => {
  const {value} = req.params;
  const squareRoot = Math.sqrt(value);
  return res.status(200).json(squareRoot);
};

const cubicRoot = (req, res) => {
  const {value} = req.params;
  const cubicRoot = Math.cbrt(value);
  return res.status(200).json(cubicRoot);
};

const paramRoot = (req, res) => {
  const {value, root} = req.params;
  const paramRoot = Math.exp((1/root)*Math.log(value));
  return res.status(200).json(paramRoot);
};



module.exports = {
  squareRoot,
  cubicRoot,
  paramRoot
};
