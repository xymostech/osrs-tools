import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl m-8 font-semibold">
        Emmy&apos;s Old School RuneScape Tools
      </h1>
      <div>
        <h2 className="text-xl">Slayer Calculators</h2>
        <ul className="list-disc list-inside">
          <li>
            <Link href="/slayer/konar-by-location">
              Konar Slayer Calculator
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
