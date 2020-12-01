import * as React from 'react';
import { ExclamationTriangleIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import {
  PageSection,
  Title,
  Button,
  EmptyState,
  EmptyStateIcon,
  EmptyStateBody,
} from '@patternfly/react-core';
import { useHistory } from 'react-router-dom';

const NotFound: React.FunctionComponent = () => {
  const { t } = useTranslation();

  function GoHomeBtn() {
    const history = useHistory();
    function handleClick() {
      history.push('/');
    }
    return (
      <Button onClick={handleClick}>{t('Take me home')}</Button>
    );
  }

  return (
    <PageSection>
    <EmptyState variant="full">
      <EmptyStateIcon icon={ExclamationTriangleIcon} />
      <Title headingLevel="h1" size="lg">
        {t('404 Page not found')}
      </Title>
      <EmptyStateBody>
        {t("We didn't find a page that matches the address you navigated to.")}
      </EmptyStateBody>
      <GoHomeBtn />
    </EmptyState>
  </PageSection>
  )
};

export { NotFound };
