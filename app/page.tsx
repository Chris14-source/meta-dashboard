import FileUploader from "@/components/upload/FileUploader";

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Analizza le tue inserzioni META
        </h2>
        <p className="text-gray-600 mt-2">
          Carica i file JSON dal tuo export Facebook per scoprire
          quali dati pubblicitari vengono raccolti su di te.
        </p>
      </div>
      <FileUploader />
    </div>
  );
}