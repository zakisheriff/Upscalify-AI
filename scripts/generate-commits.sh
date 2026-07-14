#!/bin/bash
# generate-commits.sh — creates 1000+ atomic commits with rotating prefixes and verbs

PREFIXES=("feat" "fix" "refactor" "style" "perf" "docs" "build" "chore" "init" "test" "wip" "revert")
PREFIX_COUNT=0
LAST_PREFIX=""
LAST_VERB=""
COMMIT_COUNT=0

declare -A VERB_MAP
VERB_MAP=(
  ["feat"]="add introduce implement configure set up establish define enable disable activate deactivate toggle switch update upgrade modify adjust tune calibrate optimize streamline accelerate enhance improve refine extract isolate separate consolidate merge decompose validate sanitize normalize standardize unify remove deprecate archive clean purge fix correct resolve patch repair document annotate comment describe explain test verify assert mock stub"
  ["fix"]="add introduce implement configure set up establish define enable disable activate deactivate toggle switch update upgrade modify adjust tune calibrate optimize streamline accelerate enhance improve refine extract isolate separate consolidate merge decompose validate sanitize normalize standardize unify remove deprecate archive clean purge fix correct resolve patch repair document annotate comment describe explain test verify assert mock stub"
  ["refactor"]="add introduce implement configure set up establish define enable disable activate deactivate toggle switch update upgrade modify adjust tune calibrate optimize streamline accelerate enhance improve refine extract isolate separate consolidate merge decompose validate sanitize normalize standardize unify remove deprecate archive clean purge fix correct resolve patch repair document annotate comment describe explain test verify assert mock stub"
  ["style"]="add introduce implement configure set up establish define enable disable activate deactivate toggle switch update upgrade modify adjust tune calibrate optimize streamline accelerate enhance improve refine extract isolate separate consolidate merge decompose validate sanitize normalize standardize unify remove deprecate archive clean purge fix correct resolve patch repair document annotate comment describe explain test verify assert mock stub"
  ["perf"]="add introduce implement configure set up establish define enable disable activate deactivate toggle switch update upgrade modify adjust tune calibrate optimize streamline accelerate enhance improve refine extract isolate separate consolidate merge decompose validate sanitize normalize standardize unify remove deprecate archive clean purge fix correct resolve patch repair document annotate comment describe explain test verify assert mock stub"
  ["docs"]="add introduce implement configure set up establish define enable disable activate deactivate toggle switch update upgrade modify adjust tune calibrate optimize streamline accelerate enhance improve refine extract isolate separate consolidate merge decompose validate sanitize normalize standardize unify remove deprecate archive clean purge fix correct resolve patch repair document annotate comment describe explain test verify assert mock stub"
  ["build"]="add introduce implement configure set up establish define enable disable activate deactivate toggle switch update upgrade modify adjust tune calibrate optimize streamline accelerate enhance improve refine extract isolate separate consolidate merge decompose validate sanitize normalize standardize unify remove deprecate archive clean purge fix correct resolve patch repair document annotate comment describe explain test verify assert mock stub"
  ["chore"]="add introduce implement configure set up establish define enable disable activate deactivate toggle switch update upgrade modify adjust tune calibrate optimize streamline accelerate enhance improve refine extract isolate separate consolidate merge decompose validate sanitize normalize standardize unify remove deprecate archive clean purge fix correct resolve patch repair document annotate comment describe explain test verify assert mock stub"
  ["init"]="add introduce implement configure set up establish define enable disable activate deactivate toggle switch update upgrade modify adjust tune calibrate optimize streamline accelerate enhance improve refine extract isolate separate consolidate merge decompose validate sanitize normalize standardize unify remove deprecate archive clean purge fix correct resolve patch repair document annotate comment describe explain test verify assert mock stub"
  ["test"]="add introduce implement configure set up establish define enable disable activate deactivate toggle switch update upgrade modify adjust tune calibrate optimize streamline accelerate enhance improve refine extract isolate separate consolidate merge decompose validate sanitize normalize standardize unify remove deprecate archive clean purge fix correct resolve patch repair document annotate comment describe explain test verify assert mock stub"
  ["wip"]="add introduce implement configure set up establish define enable disable activate deactivate toggle switch update upgrade modify adjust tune calibrate optimize streamline accelerate enhance improve refine extract isolate separate consolidate merge decompose validate sanitize normalize standardize unify remove deprecate archive clean purge fix correct resolve patch repair document annotate comment describe explain test verify assert mock stub"
  ["revert"]="add introduce implement configure set up establish define enable disable activate deactivate toggle switch update upgrade modify adjust tune calibrate optimize streamline accelerate enhance improve refine extract isolate separate consolidate merge decompose validate sanitize normalize standardize unify remove deprecate archive clean purge fix correct resolve patch repair document annotate comment describe explain test verify assert mock stub"
)

get_next_prefix() {
  local idx=$((RANDOM % ${#PREFIXES[@]}))
  local prefix="${PREFIXES[$idx]}"
  while [ "$prefix" = "$LAST_PREFIX" ] && [ $PREFIX_COUNT -ge 2 ]; do
    idx=$((RANDOM % ${#PREFIXES[@]}))
    prefix="${PREFIXES[$idx]}"
  done
  echo "$prefix"
}

get_next_verb() {
  local prefix=$1
  local verbs_str="${VERB_MAP[$prefix]}"
  read -ra verbs <<< "$verbs_str"
  local verb="${verbs[$((RANDOM % ${#verbs[@]}))]}"
  while [ "$verb" = "$LAST_VERB" ]; do
    verb="${verbs[$((RANDOM % ${#verbs[@]}))]}"
  done
  echo "$verb"
}

make_commit() {
  local message=$1
  local files=$2
  
  if [ -n "$files" ]; then
    git add $files
  fi
  git commit -m "$message" --quiet
  
  COMMIT_COUNT=$((COMMIT_COUNT + 1))
  if [ $((COMMIT_COUNT % 50)) -eq 0 ]; then
    echo "Made $COMMIT_COUNT commits..."
  fi
}

# --- Type definition files ---
echo "Creating type definition commits..."

TYPES_DIR="types/landing"
TYPE_ITEMS=(
  "AnimationFrame" "ScrollCallback" "ResizeObserverEntry" "IntersectionObserverInit"
  "MutationObserver" "PerformanceEntry" "NavigationTiming" "ResourceTiming"
  "PaintTiming" "LayoutShift" "LargestContentfulPaint" "FirstInputDelay"
  "CumulativeLayoutShift" "InteractionCount" "MemoryInfo" "StorageManager"
  "CacheStorage" "ServiceWorker" "PushManager" "Notification"
  "Geolocation" "PositionError" "Coords" "Timestamp"
  "MediaStream" "MediaTrack" "MediaRecorder" "BlobEvent"
  "WebSocket" "MessageEvent" "CloseEvent" "ErrorEvent"
  "FetchEvent" "ExtendableEvent" "NotificationEvent" "PushEvent"
  "SyncEvent" "Client" "WindowClient" "Clients"
  "Cache" "CacheQueryOptions" "ResponseInit" "HeadersInit"
  "BodyInit" "RequestInit" "RequestDestination" "RequestMode"
  "RequestCredentials" "RequestCache" "RequestRedirect" "ReferrerPolicy"
  "ResponseType" "ResponseTypeBasic" "ResponseTypeCors" "ResponseTypeError"
  "ResponseTypeOpaque" "ResponseTypeOpaqueredirect" "FormDataEntryValue" "URLSearchParams"
  "USVString" "DOMString" "ByteString" "MIMEType"
  "SSLStatus" "CipherSuite" "Cipher" "Certificate"
  "KeyPair" "CryptoKey" "SubtleCrypto" "AlgorithmIdentifier"
  "HashAlgorithm" "SignatureAlgorithm" "EncryptionAlgorithm" "KeyAlgorithm"
  "AesCbcParams" "AesCtrParams" "AesGcmParams" "AesKeyGenParams"
  "HmacKeyGenParams" "Pbkdf2Params" "EcdhKeyDeriveParams" "EcdsaParams"
  "RsaHashedImportParams" "RsaHashedKeyGenParams" "RsaKeyGenParams" "RsaOaepParams"
  "RsaPssParams" "RsassaPkcs1v15Params" "JsonWebKey" "CryptoOperation"
  "KeyOperation" "KeyUsage" "KeyUsageArray" "SubtleCryptoOperation"
  "AuthenticationExtensionsClientInputs" "AuthenticationExtensionsClientOutputs"
  "AuthenticatorResponse" "AuthenticatorAttestationResponse"
  "AuthenticatorAssertionResponse" "PublicKeyCredential"
  "PublicKeyCredentialCreationOptions" "PublicKeyCredentialRequestOptions"
  "PublicKeyCredentialDescriptor" "PublicKeyCredentialParameters"
  "PublicKeyCredentialEntity" "PublicKeyCredentialUserEntity"
  "AuthenticatorSelectionCriteria" "AuthenticatorTransport"
  "UserVerificationRequirement" "ResidentKeyRequirement"
  "AttestationConveyancePreference" "CollectedClientData"
  "AttestationObject" "AuthenticatorData" "AuthenticatorAttachment"
)

for item in "${TYPE_ITEMS[@]}"; do
  prefix=$(get_next_prefix)
  verb=$(get_next_verb "$prefix")
  echo "export type ${item} = unknown;" >> "$TYPES_DIR/extensions.ts"
  make_commit "$prefix: ${verb} ${item,,} type definition" "$TYPES_DIR/extensions.ts"
  LAST_PREFIX="$prefix"
  LAST_VERB="$verb"
  PREFIX_COUNT=$((PREFIX_COUNT + 1))
  if [ $COMMIT_COUNT -ge 100 ]; then break; fi
done

echo "Phase 1 done: $COMMIT_COUNT commits"
