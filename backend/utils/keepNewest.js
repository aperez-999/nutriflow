/**
 * Deletes one account's records past the newest `max`: the ones its lists no longer show.
 * Keeps saved chats and plans from growing without end on a small database.
 */
export async function keepNewest(Model, userId, sortField, max) {
  const stale = await Model.find({ user: userId }).sort({ [sortField]: -1 }).skip(max).select('_id').lean();
  if (stale.length) await Model.deleteMany({ _id: { $in: stale.map((doc) => doc._id) } });
  return stale.length;
}
