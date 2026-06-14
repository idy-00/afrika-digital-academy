export async function onRequestGet(context) {
  return Response.json({
    has_chariow_key: !!context.env.CHARIOW_API_KEY,
    env_keys_count: Object.keys(context.env || {}).length
  });
}
