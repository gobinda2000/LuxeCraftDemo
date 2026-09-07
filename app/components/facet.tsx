// app/components/Facet.tsx
import {Link, useLocation} from 'react-router';
import type {Filter} from '@shopify/hydrogen/storefront-api-types';

type FacetProps = {
  filters: Filter[];
};

export function Facet({filters}: FacetProps) {
  const {pathname, search} = useLocation();
  const params = new URLSearchParams(search);

  function buildFilterUrl(filterInput: string) {
    const parsed = JSON.parse(filterInput);
    const newParams = new URLSearchParams(params);

    // Handle different filter types
    if ('available' in parsed) {
      newParams.set('available', String(parsed.available));
    } else if ('tag' in parsed) {
      newParams.append('tag', parsed.tag);
    } else if ('price' in parsed) {
      if (parsed.price.min) newParams.set('price.min', parsed.price.min);
      if (parsed.price.max) newParams.set('price.max', parsed.price.max);
    }

    return `${pathname}?${newParams.toString()}`;
  }

  function isActive(filterInput: string): boolean {
    const parsed = JSON.parse(filterInput);
    if ('available' in parsed) {
      return params.get('available') === String(parsed.available);
    }
    if ('tag' in parsed) {
      return params.getAll('tag').includes(parsed.tag);
    }
    return false;
  }

  return (
    <div className="facets">
      {filters.map((filter) => (
        <div key={filter.id} className="facet-group">
          <h4>{filter.label}</h4>
          <ul>
            {filter.values.map((value) => (
              <li key={value.id}>
                <Link
                  to={buildFilterUrl(value.input as string)}
                  className={isActive(value.input as string) ? 'active' : ''}
                >
                  {value.label} ({value.count})
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
