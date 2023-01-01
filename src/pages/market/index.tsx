/* eslint-disable @next/next/no-img-element */
import { DocumentIcon } from "@heroicons/react/24/solid";
import { List, Modal, Tooltip } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { type NextPage } from "next";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { Inventory, Item } from "../../server/types";
import { trpc } from "../../utils/trpc";

const Market: NextPage = () => {
  const { data: sessionData, status: sessionStatus } = useSession();

  const inventoryQuery = trpc.market.inventory.useQuery(undefined, {
    refetchInterval: 1000,
  });

  const discoveredItemTypesQuery = trpc.market.discoveredItemTypes.useQuery(
    undefined,
    {
      refetchInterval: 1000,
    }
  );

  const sellItemMutation = trpc.market.sellItem.useMutation();

  const [opened, setOpened] = useState(false);
  const [price, setPrice] = useState(1);
  const [item, setItem] = useState<Item | null>(null);

  if (sessionStatus === "loading") {
    return <div>Loading...</div>;
  }

  if (!sessionData) {
    return <div>Not signed in</div>;
  }

  const handleItemClick = async (item: Item | null) => {
    if (item) {
      setItem(item);
      setOpened(true);
    }
  };

  const handleItemSell = async () => {
    if (item) {
      await sellItemMutation.mutateAsync({
        index: item.index,
        price,
      });

      setItem(null);
      setOpened(false);

      showNotification({
        message: "Item sold",
      });

      inventoryQuery.refetch();
    }
  };

  return (
    <>
      <Modal opened={opened} onClose={() => setOpened(false)} title="Sell item">
        <div className="flex flex-col gap-2">
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
          <button onClick={handleItemSell}>Sell</button>
        </div>
      </Modal>

      <h1 className="mb-4 text-4xl font-bold">Market</h1>

      <h2 className="mb-4 text-2xl font-bold">Inventory</h2>

      <p className="mb-4">
        This is your current inventory (or an error message if you&apos;re not
        online), click items to publish them.{" "}
        <span className="text-red-500">
          warning: you probably don&apos;t want to do that, the market is a work
          in progress and you may lose your items
        </span>
      </p>

      {inventoryQuery.isLoading && <div>Loading...</div>}

      {inventoryQuery.isError && <div>Error</div>}

      {inventoryQuery.data && (
        <Inventory inventory={inventoryQuery.data} onClick={handleItemClick} />
      )}

      <h2 className="mb-4 text-2xl font-bold">Discovered Items</h2>

      <p className="mb-4">
        These are the items the market has &quot;discovered&quot;. Items are
        discovered from the first time a unique item is published.
      </p>

      {discoveredItemTypesQuery.isLoading && <div>Loading...</div>}
      {discoveredItemTypesQuery.isError && <div>Error</div>}
      {discoveredItemTypesQuery.data && (
        <List>
          {discoveredItemTypesQuery.data.map((item, id) => (
            <List.Item
              icon={
                item.image ? (
                  <img src={item.image} alt={item.name} />
                ) : (
                  <DocumentIcon />
                )
              }
              key={id}
            >
              {item.name}
            </List.Item>
          ))}
        </List>
      )}
    </>
  );
};

export default Market;

const Item: React.FC<{
  item: Item | null;
  onClick?: () => void;
}> = ({ item, onClick }) => {
  return (
    <Tooltip label={item?.name ? `${item.name} (${item.amount})` : undefined}>
      <div onClick={onClick} className="cursor-pointer">
        {item ? (
          <img className="h-10 w-10 border" src={item.image} alt={item.name} />
        ) : (
          <div className="h-10 w-10 border" />
        )}
      </div>
    </Tooltip>
  );
};

const Inventory: React.FC<{
  inventory: Inventory;
  onClick?: (item: Item | null) => void;
}> = ({ inventory, onClick }) => {
  const handleItemClick = (item: Item | null) => {
    onClick?.(item);
  };

  return (
    <div className="flex flex-row gap-1">
      <div className="flex flex-col gap-1">
        <div className="grid w-fit grid-cols-9 grid-rows-3 gap-1">
          {inventory.inventory.map((item, id) => (
            <Item key={id} item={item} onClick={() => handleItemClick(item)} />
          ))}
        </div>

        <div className="grid w-fit grid-cols-9 grid-rows-1 gap-1">
          {inventory.hotBar.map((item, id) => (
            <Item key={id} item={item} onClick={() => handleItemClick(item)} />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <div className="grid w-fit grid-cols-1 grid-rows-4 gap-1">
          {inventory.armor.map((item, id) => (
            <Item key={id} item={item} onClick={() => handleItemClick(item)} />
          ))}
        </div>
        <div className="grid w-fit grid-cols-1 grid-rows-1 gap-1">
          {inventory.offHand.map((item, id) => (
            <Item key={id} item={item} onClick={() => handleItemClick(item)} />
          ))}
        </div>
      </div>
    </div>
  );
};