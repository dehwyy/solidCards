import { Body, Controller, Delete, Get, InternalServerErrorException, NotFoundException, ParseIntPipe, Post, Query } from "@nestjs/common"
import { CollectionService } from "./collection.service"
import { CardService } from "../card/card.service"
import { CreateCardDTO } from "../card/models/card.dto"
import { ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from "@nestjs/swagger"
import CreateCollectionDTO, { GetCollectionResponse, PostCollectionResponse } from "./models/collection.dto"

@ApiTags("CollectionsResolver")
@Controller("/collection")
export class CollectionController {
  constructor(private collectionService: CollectionService, private cardService: CardService) {}

  @ApiInternalServerErrorResponse({ description: "Server or db error while creating card" })
  @ApiNotFoundResponse({ description: "card was successfully generated, but no collection match provided id" })
  @ApiCreatedResponse({ description: "created card and add it to the collection", type: PostCollectionResponse })
  @Post("/add")
  async createCardAndAddToCollection(@Body() cardData: CreateCardDTO, @Query("id", ParseIntPipe) id: number) {
    let card
    try {
      card = await this.cardService.createCard(cardData)
    } catch (e) {
      throw new InternalServerErrorException("error during creating card")
    }
    try {
      const collection = await this.collectionService.addToCollection(id, card)
      return collection
    } catch (e) {
      throw new NotFoundException("collection with provided id hasn't been found")
    }
  }

  @ApiInternalServerErrorResponse({ description: "Server or db error while creating collection" })
  @ApiCreatedResponse({ description: "created collection", type: PostCollectionResponse })
  @Post("/")
  async createCollection(@Body() collectionDto: CreateCollectionDTO) {
    try {
      const collection = await this.collectionService.createCollection(collectionDto)
      return collection
    } catch (e) {
      throw new InternalServerErrorException("error during creating collection")
    }
  }

  @ApiNotFoundResponse({ description: "collection with provided id hasn't been found" })
  @ApiOkResponse({ description: "successfully get collection by its id", type: GetCollectionResponse })
  @Get("/")
  async getCardsFromCollection(@Query("id", ParseIntPipe) id: number) {
    try {
      const collection = await this.collectionService.getCardsByCollectionId(id)
      return collection
    } catch (e) {
      throw new NotFoundException("collection with provided id hasn't been found")
    }
  }

  @ApiOkResponse({ description: "successfully got collections", type: GetCollectionResponse, isArray: true })
  @Get("/all")
  async getAllCollections() {
    const collections = this.collectionService.getAllCollections()
    return collections
  }

  @ApiOkResponse({ description: "successfully got collections", type: GetCollectionResponse, isArray: true })
  @Delete()
  async deleteCollection(@Query("id", ParseIntPipe) id: number) {
    const collections = this.collectionService.deleteCollection(id)
    return collections
  }
}
