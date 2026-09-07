import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';
import type {CollectionFragment} from 'storefrontapi.generated';

export function CollectionList({
  collection,
  index,
}: {
  collection: CollectionFragment;
  index: number;
}) {
  return (
    <Link
      className="collection-card"
      to={`/collections/${collection.handle}`}
      prefetch="intent"
    >
      {collection.image && (
        <Image
          data={collection.image}
          alt={collection.image.altText || collection.title}
          aspectRatio="1/1"
          loading={index < 5 ? 'eager' : undefined}
          sizes="(min-width: 45em) 400px, 100vw"
        />
      )}

      <div className="collection-card-content">
        <div>
          <h2>{collection.title}</h2>
          {/* <p>{collection.description}</p> */}
        </div>

        <span>Shop {collection.title}</span>
      </div>
    </Link>
  );
}

