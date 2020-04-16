const { VCParts: VCPartsModel } = require('src/db');
const { storeVCPartsPeriod } = require('src/managers/events/constants');

let isAllowStoreVCParts = true;

module.exports = async VCPartsGroups => {
  if (isAllowStoreVCParts) {
    await handleVCParts(VCPartsGroups);
  }
  isAllowStoreVCParts = false;
  allowStoreTimeout();
};

const handleVCParts = async VCPartsGroups => {
  for (const VCPartsGroup of VCPartsGroups) {
    const {
      vc_parts: VCParts,
      group_name: groupName,
      group_id: groupId,
    } = VCPartsGroup;
    await iterateVCPartsGroup(VCParts, groupName, groupId);
  }
};

const iterateVCPartsGroup = async (VCParts, groupName, groupId) => {
  for (const VCPart of VCParts) {
    const { id, name } = VCPart;
    await storeVCPart(id, name, groupName, groupId);
  }
};

const storeVCPart = async (id, name, groupName, groupId) =>
  VCPartsModel.findOneAndUpdate(
    { name },
    { id, name, groupName, groupId },
    { upsert: true },
  );

const allowStoreTimeout = () =>
  setTimeout(() => {
    isAllowStoreVCParts = true;
  }, storeVCPartsPeriod);
