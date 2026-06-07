import PageHeading from "../../components/PageHeading";
import { fetchApi } from "../../lib/api";
import { demoMuseum } from "../../lib/demo";

const fallbackAuctions = demoMuseum.map((item, index) => ({
  id: item.id,
  title: item.auction.title,
  description: item.editorial,
  rarity: item.auction.rarity,
  currentPrice: item.auction.finalPrice,
  imageUrls: item.auction.imageUrls,
  status: index === 0 ? "ENDING" : "ACTIVE",
  endTime: new Date(Date.now() + (index + 1) * 3600000).toISOString(),
  _count: item.auction._count,
}));

export default async function AuctionPage() {
  const auctions = await fetchApi("/auctions?status=ACTIVE", fallbackAuctions);
  return (
    <main className="page-wrap">
      <PageHeading eyebrow="The Grand Colosseum" title="Auctions Open for Glory" description="Telusuri lelang aktif, bandingkan relik, dan siapkan bid sebelum waktu berakhir." />
      <section className="auction-grid">
        {auctions.map((auction) => (
          <article key={auction.id} className="panel auction-card">
            <div className="auction-image"><img src={auction.imageUrls[0]} alt={auction.title} /></div>
            <div>
              <span>{auction.rarity} - {auction.status}</span>
              <h2>{auction.title}</h2>
              <p>{auction.description}</p>
              <div className="auction-meta"><b>{auction.currentPrice.toLocaleString("id-ID")} CC</b><time>{new Date(auction.endTime).toLocaleString("id-ID")}</time></div>
              <button className="primary-action">View auction</button>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
