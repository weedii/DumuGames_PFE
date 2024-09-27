/* eslint-disable react/prop-types */
import { Modal, Select } from "antd";
import { useRef, useState } from "react";
import Spinner from "../../Components/Spinner";
import { toast } from "react-hot-toast";
import axios from "axios";
import { regionsArray } from "./ArraysOfSelect";
import API_URL from "../../utils/apiConfig";

const UpdateCardsModal = ({
  showModal,
  setShowModal,
  cardTypesArray,
  getAllCards,
}) => {
  const [selectedFileCodes, setSelectedFileCodes] = useState(null);
  const fileInputRef = useRef(null);
  const [fileCodes, setFileCodes] = useState({});
  const [loadingCodeParsing, setLoadingCodeParsing] = useState(false);
  const [type, setType] = useState("");
  const [amountt, setAmountt] = useState("");
  const [price, setPrice] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [region, setRegion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOnClose = () => {
    setSelectedFileCodes(null);
    setType("");
    setRegion("");
    setAmountt("");
    setPrice(0);
    setQuantity(0);
    setFileCodes({});
    setShowModal(false);
  };

  const handleFileCodes = (e) => {
    if (e.target.files[0].type !== "text/plain") {
      toast.error("file must be txt file");
      fileInputRef.current.value = null;
      return;
    }

    setLoadingCodeParsing(true);
    const file = e.target.files[0];
    setSelectedFileCodes(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/);

      const codes = lines
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      setFileCodes((prevFileCodes) => ({
        ...prevFileCodes,
        [amountt]: { [region]: codes },
      }));
      setQuantity(codes.length);
      setLoadingCodeParsing(false);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !type ||
      !region ||
      quantity <= 0 ||
      Number(price) <= 0 ||
      !fileCodes[amountt]
    ) {
      toast.error("Missing Fields!");
      return;
    } else {
      // const amountsWithRegions = [{ [amountt]: [region] }];
      try {
        setLoading(true);
        const res = await axios.post(
          `${API_URL}/api/admin/add-cards`,
          {
            type,
            region,
            amount: amountt,
            quantity,
            price: Number(price),
            codes: fileCodes,
          },
          { withCredentials: true }
        );
        if (res.data.success) {
          toast.success("Saved successfully!");
          await new Promise((resolve) => setTimeout(resolve, 500));
          setLoading(false);
          setShowModal(false);
          handleOnClose();
          getAllCards();
        }
      } catch (error) {
        // console  ("erroraa", error);
        setLoading(false);
        setShowModal(false);
      }
    }
  };

  return (
    <Modal
      title="Update Cards"
      className="font-body"
      open={showModal}
      destroyOnClose
      onCancel={handleOnClose}
      footer={null}
    >
      {/* <Toaster position="top-center" reverseOrder={false} /> */}

      {cardTypesArray.length === 0 ? (
        <p className="text-xl text-[#5956E9] font-body text-center my-10 w-1/2 mx-auto font-semibold">
          No Crads To Update You need To Create Some!
        </p>
      ) : (
        <div className="mt-7 border-t border-t-neutral-400 p-2">
          <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
            <p className="text-sm font-medium">Select Card Type</p>
            <Select
              defaultValue={type}
              style={{
                width: 200,
              }}
              onChange={(e) => setType(e)}
              options={cardTypesArray}
            />

            {type && (
              <>
                <p className="text-sm font-medium">Select Region</p>
                <Select
                  defaultValue={region}
                  style={{
                    width: 200,
                  }}
                  onChange={(e) => setRegion(e)}
                  options={regionsArray}
                />
              </>
            )}

            {region && (
              <>
                <p className="text-sm font-medium">
                  Amount in €:
                  <span className="text-xs text-red-700 font-normal">
                    {" "}
                    (One amount can be added at a time)
                  </span>
                </p>
                <input
                  type="number"
                  min={1}
                  value={amountt || ""}
                  onChange={(e) => setAmountt(e.target.value)}
                  className="border px-2 py-1 rounded-md outline outline-1 outline-slate-300 text-sm font-semibold focus-within:ring-2"
                />
              </>
            )}

            {amountt && (
              <>
                <p className="text-sm font-medium">Price in €:</p>
                <input
                  type="number"
                  step="0.01"
                  // min={1}
                  value={price > 0 ? price : ""}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="border px-2 py-1 rounded-md outline outline-1 outline-slate-300 text-sm font-semibold focus-within:ring-2"
                />
              </>
            )}

            {loadingCodeParsing ? (
              <Spinner />
            ) : selectedFileCodes ? (
              <p className="text-sm font-medium text-blue-600">
                *File Name:
                <span className="text-xs text-black">
                  {" " + selectedFileCodes.name}
                </span>
              </p>
            ) : (
              price > 0 && (
                <>
                  <p className="text-sm font-medium">
                    Upload Text File For Codes:
                    <span className="text-sm text-red-700"> *(.txt)</span>
                  </p>
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileCodes}
                    ref={fileInputRef}
                    className="cursor-pointer mr-56"
                  />
                </>
              )
            )}

            {fileCodes[amountt] && (
              <>
                <p className="text-sm font-medium">Quantity:</p>
                <input
                  type="number"
                  disabled
                  id="quantity"
                  value={quantity}
                  className="border px-2 py-1 rounded-md outline outline-1 outline-slate-300 text-sm font-semibold focus-within:ring-2 cursor-not-allowed"
                />
              </>
            )}

            <div className="flex justify-end mt-5 gap-3">
              <button
                type="button"
                onClick={handleOnClose}
                disabled={loading}
                className="bg-red-700 px-3 py-2 rounded-md shadow-md text-white text-sm hover:bg-opacity-85 disabled:cursor-not-allowed disabled:bg-opacity-75"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="bg-green-700 px-4 py-2 rounded-md shadow-md text-white text-sm hover:bg-opacity-85 disabled:cursor-not-allowed disabled:bg-opacity-75"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};

export default UpdateCardsModal;
