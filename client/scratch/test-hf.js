async function test() {
  const hfToken = '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'
  const url = 'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2'
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hfToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs: "Halo dunia" })
    })
    const data = await res.json()
    console.log("Response:", data)
  } catch (err) {
    console.error("Full error:", err)
  }
}

test()
