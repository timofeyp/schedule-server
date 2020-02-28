const { VCParts, EventsData } = require('src/db');

const getSelectedVcParts = async (req, res) => {
  const result = await EventsData.aggregate(
    EventsData.getSelectedVCPartsQuery(),
  );
  return res.json(result);
};

const getVCParts = async (req, res) => {
  const result = await VCParts.find({});
  return res.json(result);
};

module.exports = {
  getVCParts,
  getSelectedVcParts,
};
